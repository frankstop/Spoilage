(function () {
  const S = (window.SPOILAGE = window.SPOILAGE || {});
  const SAVE_KEY = 'spoilage_run_v1';
  const SETTINGS_KEY = 'spoilage_settings_v1';

  class RNG {
    constructor(seed) { this.state = (seed >>> 0) || 0x6d2b79f5; }
    next() { let x=this.state; x^=x<<13; x^=x>>>17; x^=x<<5; this.state=x>>>0; return this.state/4294967296; }
    int(max) { return Math.floor(this.next()*max); }
    pick(arr) { return arr[this.int(arr.length)]; }
    shuffle(arr) { for(let i=arr.length-1;i>0;i--){const j=this.int(i+1);[arr[i],arr[j]]=[arr[j],arr[i]];} return arr; }
  }

  class Game {
    constructor(onChange) {
      this.onChange = onChange || (()=>{});
      this.uid = 1;
      this.settings = Object.assign({textSize:1,reducedMotion:false,holdConfirm:false,volume:.42,extendedIntents:true}, this.loadJSON(SETTINGS_KEY));
      this.state = {screen:'menu',run:null,combat:null,overlay:null,toast:''};
      this.rng = new RNG(1);
    }
    loadJSON(key){try{return JSON.parse(localStorage.getItem(key)||'null')||{};}catch(e){return {};}}
    notify(message){this.state.toast=message;this.emit(false);clearTimeout(this.toastTimer);this.toastTimer=setTimeout(()=>{this.state.toast='';this.emit(false);},1800);}
    emit(save=true){if(save) this.save(); this.onChange(this.state);}
    save(){localStorage.setItem(SETTINGS_KEY,JSON.stringify(this.settings));if(this.state.run)localStorage.setItem(SAVE_KEY,JSON.stringify({state:this.state,rng:this.rng.state,uid:this.uid}));}
    hasSave(){return !!localStorage.getItem(SAVE_KEY);}
    continue(){const data=this.loadJSON(SAVE_KEY);if(!data.state)return;this.state=data.state;this.rng=new RNG(data.rng);this.uid=data.uid||1;this.emit(false);}
    clearSave(){localStorage.removeItem(SAVE_KEY);}
    setScreen(screen){this.state.screen=screen;this.state.overlay=null;this.emit();}
    updateSettings(patch){Object.assign(this.settings,patch);this.emit();}
    log(text,kind='info'){const c=this.state.combat;if(c){c.log.unshift({text,kind,turn:c.turn});c.log=c.log.slice(0,80);}}
    makeSeed(input){if(input&&/^\d+$/.test(input))return Number(input)>>>0;let h=2166136261;String(input||Date.now()).split('').forEach(ch=>{h^=ch.charCodeAt(0);h=Math.imul(h,16777619);});return h>>>0;}
    buildMap(){return [
      [{type:'combat',label:'Orchard path'},{type:'combat',label:'Stone stile'}],
      [{type:'event',label:'Field note'},{type:'combat',label:'Pear rows'}],
      [{type:'market',label:'Hedge market'},{type:'kitchen',label:'Blue kitchen'}],
      [{type:'combat',label:'Cider road'},{type:'elite',label:'Marked orchard'}],
      [{type:'camp',label:'Canvas camp'},{type:'event',label:'Old pantry'}],
      [{type:'combat',label:'King’s verge'},{type:'market',label:'Last market'}],
      [{type:'elite',label:'Glass gate'},{type:'kitchen',label:'Field kitchen'}],
      [{type:'boss',label:'The Orchard King'}]
    ];}
    startingDeck(){return ['strike','strike','strike','strike','guard','guard','guard','folded_leaf','red_knife','summer_peach'].map(id=>({uid:this.uid++,id,upgraded:false,shelfBonus:0}));}
    newRun(seedInput,tutorial=false){
      const seed=this.makeSeed(seedInput);this.rng=new RNG(seed);this.uid=1;
      this.state={screen:'map',overlay:null,toast:'',run:{seed,rngState:seed,row:0,hp:70,maxHp:70,coin:40,deck:this.startingDeck(),relics:['coolcloth'],map:this.buildMap(),stats:{cardsPlayed:0,cardsPerished:0,rotConsumed:0,combats:0,turns:0,preserved:0,damageTaken:0},visited:[],removals:0,nextCombatCards:[],nextStatus:{},tutorial,tutorialStep:0},combat:null};
      if(tutorial){this.state.run.deck.push({uid:this.uid++,id:'scrape_board',upgraded:false,shelfBonus:0});this.startCombat(['orchard_wasp'],true);this.state.combat.enemies[0].hp=this.state.combat.enemies[0].maxHp=80;this.state.screen='combat';}
      this.emit();
    }
    currentNode(){const r=this.state.run;return r&&r.map[r.row];}
    chooseNode(index){const r=this.state.run,node=r.map[r.row][index];if(!node)return;r.visited.push({row:r.row,index,type:node.type});
      if(node.type==='combat')this.startCombat(this.encounter(false));
      else if(node.type==='elite')this.startCombat([this.rng.pick(['cider_hag','glasshouse_bailiff'])]);
      else if(node.type==='boss')this.startCombat(['orchard_king']);
      else if(node.type==='event')this.openEvent();
      else if(node.type==='market')this.openMarket();
      else if(node.type==='kitchen'){this.state.screen='kitchen';this.emit();}
      else if(node.type==='camp'){this.state.screen='camp';this.emit();}
    }
    encounter(){const row=this.state.run.row;const pool=S.enemies.filter(e=>!e.elite&&!e.boss).map(e=>e.id);const count=row<2?1:row<5?2:3;return Array.from({length:count},()=>this.rng.pick(pool));}
    cardDef(inst){const base=S.cardById[inst.id];if(!base)return null;if(!inst.upgraded||!base.upgrade)return base;return Object.assign({},base,base.upgrade,{text:base.upText||base.text});}
    makeCombatCard(deckCard){const def=this.cardDef(deckCard);const shelf=def.shelf==null?null:Math.max(1,def.shelf+(deckCard.shelfBonus||0));const risk=this.hasRelic('cracked_larder')&&shelf!=null?1:0;return {uid:deckCard.uid||this.uid++,id:deckCard.id,upgraded:!!deckCard.upgraded,shelfBonus:deckCard.shelfBonus||0,freshness:shelf==null?null:Math.max(1,shelf-risk),maxFreshness:shelf,drawnTurn:0,sealed:0,tempPower:0};}
    startCombat(enemyIds, tutorial=false){
      const r=this.state.run;const draw=r.deck.map(c=>this.makeCombatCard(c));(r.nextCombatCards||[]).forEach(id=>draw.push(this.makeCombatCard({uid:this.uid++,id})));r.nextCombatCards=[];this.rng.shuffle(draw);
      const enemies=enemyIds.map((id,i)=>{const d=S.enemyById[id];const scale=Math.max(0,r.row-2);return {uid:'e'+this.uid++,id,hp:d.hp+scale*4,maxHp:d.hp+scale*4,block:0,intentIndex:0,status:{tender:0},markedUid:null,dead:false};});
      this.state.combat={turn:0,vigor:3,guard:0,hand:[],draw,discard:[],rot:0,exhaust:[],enemies,selectedEnemy:0,log:[],powers:{},status:Object.assign({mold:0,sated:0},r.nextStatus||{}),playedThisTurn:0,drawLimit:5,compost:0,delayedDamage:0,pendingPlay:null,pendingChoice:null,firstPreserve:false,firstRot:false,firstRipe:false,fruitPhase:'Harvest',tutorial:!!tutorial};r.nextStatus={};r.stats.combats++;
      if(this.hasRelic('cracked_larder'))this.state.combat.vigor=4;
      this.state.screen='combat';this.log(`Combat begins: ${enemies.map(e=>S.enemyById[e.id].name).join(', ')}.`,'system');this.startTurn(true);this.emit();
    }
    startTurn(initial=false){const c=this.state.combat;if(!c)return;c.turn++;this.state.run.stats.turns++;c.guard=0;c.vigor=3+(c.turn===1&&this.hasRelic('cracked_larder')?1:0);c.playedThisTurn=0;c.firstRipe=false;c.firstRot=false;c.preserveThisTurn=false;c.drawLimit=c.famineNext?3:5;c.famineActive=!!c.famineNext;c.famineNext=false;this.drawTo(c.drawLimit);this.log(`Turn ${c.turn}. Draw to ${c.drawLimit}.`,'turn');if(!initial)this.emit();}
    drawOne(sealed=false){const c=this.state.combat;if(!c)return null;if(c.hand.length>=8)return null;if(!c.draw.length){if(!c.discard.length)return null;c.draw=this.rng.shuffle(c.discard.splice(0));this.log('Discard reshuffled.','system');}
      const card=c.draw.shift();card.drawnTurn=c.turn;if(sealed)card.sealed=1;c.hand.push(card);const p=c.powers.drawGuard||0;if(p)c.guard+=p;return card;}
    draw(n){for(let i=0;i<n;i++)this.drawOne();}
    drawTo(n){while(this.state.combat.hand.length<n&&this.drawOne());}
    isRipe(card){return card.freshness!=null&&card.freshness>0&&(card.maxFreshness===1||card.freshness<=card.maxFreshness/2);}
    cardCost(card){const d=this.cardDef(card);return Math.max(0,d.cost+(this.state.combat.status.sated>0?1:0));}
    livingEnemies(){return this.state.combat.enemies.filter(e=>!e.dead&&e.hp>0);}
    targetEnemy(){const c=this.state.combat;let e=c.enemies[c.selectedEnemy];if(!e||e.dead)e=this.livingEnemies()[0];return e;}
    selectEnemy(index){this.state.combat.selectedEnemy=index;this.emit(false);}
    playCard(uid){const c=this.state.combat;const card=c.hand.find(x=>x.uid===uid);if(!card)return;const def=this.cardDef(card);const cost=this.cardCost(card);if(cost>c.vigor){this.notify('Not enough Vigor.');return;}
      if(def.options){c.pendingChoice={uid,options:def.options};this.emit(false);return;}
      const actions=this.actionsFor(card,def);const targetAction=actions.find(a=>['preserveTarget','sealTarget','spoilTarget','bruiseTarget'].includes(a[0]));
      if(targetAction&&c.hand.filter(x=>x.uid!==uid).length){c.pendingPlay={uid,actions,targetType:targetAction[0]};this.log(`Choose a card for ${def.name}.`,'preview');this.emit(false);return;}
      this.finalizePlay(card,actions,null);
    }
    chooseOption(index){const c=this.state.combat,p=c.pendingChoice;if(!p)return;const card=c.hand.find(x=>x.uid===p.uid);const choice=p.options[index];c.pendingChoice=null;if(card&&choice)this.finalizePlay(card,choice.actions,null);}
    targetCard(uid){const c=this.state.combat,p=c.pendingPlay;if(!p)return;const source=c.hand.find(x=>x.uid===p.uid),target=c.hand.find(x=>x.uid===uid);if(!source||!target||source.uid===target.uid)return;c.pendingPlay=null;this.finalizePlay(source,p.actions,target);}
    cancelPending(){const c=this.state.combat;if(c){c.pendingPlay=null;c.pendingChoice=null;this.emit(false);}}
    actionsFor(card,def){let actions=this.isRipe(card)&&def.ripeActions?def.ripeActions:def.actions||[];actions=actions.slice();if(this.isRipe(card)&&def.ripeBonus)actions=actions.concat(def.ripeBonus);if(!this.isRipe(card)&&def.freshBonus)actions=actions.concat(def.freshBonus);return actions;}
    finalizePlay(card,actions,target){const c=this.state.combat,def=this.cardDef(card);const cost=this.cardCost(card);if(cost>c.vigor)return;c.vigor-=cost;if(c.status.sated>0)c.status.sated--;c.hand.splice(c.hand.indexOf(card),1);c.playedThisTurn++;this.state.run.stats.cardsPlayed++;this.log(`Played ${def.name} for ${cost} Vigor.`,'play');
      this.execute(actions,{card,target});
      if(def.exhaust)c.exhaust.push(card);else c.discard.push(card);
      if(this.hasRelic('dinner_bell')&&!c.hand.some(x=>x.freshness!=null))this.draw(1);
      this.checkDeaths();this.tutorialEvent('play');this.emit();}
    execute(actions,ctx={}){(actions||[]).forEach(a=>this.executeOne(a,ctx));}
    executeOne(a,ctx){const c=this.state.combat,r=this.state.run,type=a[0],n=a[1]||0,target=ctx.target;
      if(type==='damage')this.damageEnemy(this.targetEnemy(),n+(ctx.card?.tempPower||0));
      else if(type==='allDamage')this.livingEnemies().forEach(e=>this.damageEnemy(e,n+(ctx.card?.tempPower||0)));
      else if(type==='block'){let value=n+(ctx.card?.tempPower||0);if(ctx.card&&this.cardDef(ctx.card).shelf==null&&this.hasRelic('white_thread'))value+=2;c.guard+=value;this.log(`Gained ${value} Guard.`,'guard');}
      else if(type==='draw')this.draw(n);
      else if(type==='drawSealed')for(let i=0;i<n;i++)this.drawOne(true);
      else if(type==='vigor')c.vigor+=n;
      else if(type==='heal'){const before=r.hp;r.hp=Math.min(r.maxHp,r.hp+n);this.log(`Healed ${r.hp-before} HP.`,'heal');}
      else if(type==='preserveTarget')this.preserve(target,n);
      else if(type==='sealTarget'){if(target){target.sealed+=(n||1);this.log(`${this.cardDef(target).name} is Sealed.`,'preserve');}}
      else if(type==='spoilTarget'){if(target)this.perish(target,true);}
      else if(type==='bruiseTarget'){if(target)this.bruise(target,n);}
      else if(type==='preserveOldest'){const x=this.oldestCard();if(x)this.preserve(x,n);}
      else if(type==='sealOldest'){const x=this.oldestCard();if(x){x.sealed+=n;this.log(`${this.cardDef(x).name} is Sealed.`,'preserve');}}
      else if(type==='preserveAll')c.hand.forEach(x=>this.preserve(x,n));
      else if(type==='consumeRotDamage'){const used=this.consumeRot(Math.min(c.rot,n));this.damageEnemy(this.targetEnemy(),used*a[2]);}
      else if(type==='consumeRotBlock'){const used=this.consumeRot(Math.min(c.rot,n));c.guard+=used*a[2];this.log(`Rot becomes ${used*a[2]} Guard.`,'rot');}
      else if(type==='consumeAllRotDamage'){const used=this.consumeRot(c.rot);this.livingEnemies().forEach(e=>this.damageEnemy(e,used*n));}
      else if(type==='consumeRotHeal'){const used=this.consumeRot(Math.min(c.rot,n));if(used){const before=r.hp;r.hp=Math.min(r.maxHp,r.hp+a[2]*used);this.log(`Rot heals ${r.hp-before}.`,'heal');}}
      else if(type==='tender'){const e=this.targetEnemy();if(e)e.status.tender=(e.status.tender||0)+n;}
      else if(type==='moldSelf')c.status.mold+=n;
      else if(type==='satedSelf')c.status.sated+=n;
      else if(type==='rot')c.rot+=n;
      else if(type==='addCard')for(let i=0;i<(a[2]||1);i++){const x=this.makeCombatCard({uid:this.uid++,id:a[1]});x.drawnTurn=c.turn;c.hand.push(x);}
      else if(type==='power')c.powers[a[1]]=(c.powers[a[1]]||0)+a[2];
      else if(type==='fruitVigor'){if(c.famineActive)c.vigor+=n;}
      else if(type==='delayedDamage')c.delayedDamage+=n;
      else if(type==='drawIfLastPerishable'){if(!c.hand.some(x=>x.freshness!=null))this.draw(n);}
      else if(type==='cleanPlate'){if(c.rot===0)this.damageEnemy(this.targetEnemy(),n);else{this.consumeRot(1);const before=r.hp;r.hp=Math.min(r.maxHp,r.hp+a[2]);this.log(`Clean Plate heals ${r.hp-before}.`,'heal');}}
    }
    damageEnemy(enemy,amount){if(!enemy||enemy.dead)return;let value=amount;if(enemy.status.tender>0){value=Math.ceil(value*1.5);enemy.status.tender--;this.log('Tender breaks for +50% damage.','status');}const blocked=Math.min(enemy.block||0,value);enemy.block-=blocked;value-=blocked;enemy.hp-=value;this.log(`${S.enemyById[enemy.id].name} takes ${value} damage.`,'damage');}
    damagePlayer(amount){const c=this.state.combat,r=this.state.run;if(!c||!r)return;if(c.status.tender>0){amount=Math.ceil(amount*1.5);c.status.tender--;this.log('Tender breaks: incoming damage +50%.','status');}const blocked=Math.min(c.guard,amount);c.guard-=blocked;const hit=amount-blocked;r.hp=Math.max(0,r.hp-hit);r.stats.damageTaken+=hit;this.log(`You take ${hit} damage (${blocked} blocked).`,'enemy');if(r.hp<=0)this.finishRun(false);}
    preserve(card,n){if(!card||card.freshness==null)return;const before=card.freshness;card.freshness=Math.min(card.maxFreshness,card.freshness+n);const gain=card.freshness-before;if(gain<=0)return;this.state.run.stats.preserved+=gain;this.log(`${this.cardDef(card).name} preserved by ${gain}.`,'preserve');const c=this.state.combat;if(c.powers.preserveGuard&&!c.preserveThisTurn){c.guard+=c.powers.preserveGuard;c.preserveThisTurn=true;}if(this.hasRelic('coolcloth')&&!c.firstPreserve){card.tempPower=(card.tempPower||0)+1;c.firstPreserve=true;this.flashRelic='coolcloth';this.log('Coolcloth grants +1 temporary power.','relic');}}
    bruise(card,n){if(!card||card.freshness==null)return;const was=this.isRipe(card);card.freshness-=n;this.log(`${this.cardDef(card).name} is Bruised ${n}.`,'status');if(card.freshness<=0)this.perish(card,true);else if(!was&&this.isRipe(card))this.onRipe(card);}
    oldestCard(){return this.state.combat.hand.filter(x=>x.freshness!=null).sort((a,b)=>(a.freshness/a.maxFreshness)-(b.freshness/b.maxFreshness))[0];}
    onRipe(card){const c=this.state.combat;this.log(`${this.cardDef(card).name} becomes Ripe.`,'ripe');if(c.powers.ripeGuard)c.guard+=c.powers.ripeGuard;if(this.hasRelic('amber_clock')&&!c.firstRipe){c.firstRipe=true;this.draw(1);}this.tutorialEvent('ripe');}
    perish(card,forced=false){const c=this.state.combat,index=c.hand.indexOf(card);if(index>=0)c.hand.splice(index,1);const def=this.cardDef(card);const rotAction=(def.perish||[]).find(a=>a[0]==='rot');c.rot+=rotAction?rotAction[1]:1;this.state.run.stats.cardsPerished++;this.log(`${def.name} perishes${rotAction?` into ${rotAction[1]} Rot`:''}.`,'perish');if(def.perish)this.execute(def.perish.filter(a=>a[0]!=='rot'),{card});if(c.powers.perishDamage)this.livingEnemies().forEach(e=>this.damageEnemy(e,c.powers.perishDamage));if(this.hasRelic('silver_mold')&&this.isRipe(card))this.livingEnemies().forEach(e=>this.damageEnemy(e,3));if(this.hasRelic('ledger_waste')&&this.state.run.stats.cardsPerished%5===0){this.state.run.coin+=10;this.log('Ledger of Waste records 10 Coin.','relic');}this.tutorialEvent('perish');}
    consumeRot(n){const c=this.state.combat;if(!n)return 0;c.rot-=n;c.compost+=n;this.state.run.stats.rotConsumed+=n;if(this.hasRelic('blue_crock')&&!c.firstRot)c.compost++;if(this.hasRelic('gleaners_hook')&&!c.firstRot){this.state.run.hp=Math.min(this.state.run.maxHp,this.state.run.hp+4);this.log('Gleaner’s Hook heals 4.','relic');}c.firstRot=true;this.log(`Consumed ${n} Rot.`,'rot');this.tutorialEvent('consume');return n;}
    hasRelic(id){return !!this.state.run?.relics.includes(id);}
    endTurn(){const c=this.state.combat;if(!c||c.pendingPlay||c.pendingChoice)return;if(this.hasRelic('bees_wax')&&c.hand[0])c.hand[0].sealed=Math.max(1,c.hand[0].sealed);const hand=c.hand.slice();
      hand.forEach(card=>{if(card.freshness==null)return;if(card.drawnTurn===c.turn)return;if(card.sealed>0){card.sealed--;this.log(`${this.cardDef(card).name} stays fresh under its Seal.`,'preserve');return;}const was=this.isRipe(card);card.freshness--;this.log(`${this.cardDef(card).name} ages to ${Math.max(0,card.freshness)}.`,'age');this.tutorialEvent('age');if(card.freshness<=0)this.perish(card);else if(!was&&this.isRipe(card))this.onRipe(card);});
      if(c.status.mold>0){const candidates=c.hand.filter(x=>x.freshness!=null);if(candidates.length)this.bruise(this.rng.pick(candidates),1);c.status.mold=Math.max(0,c.status.mold-1);}
      this.resolveEnemies();if(this.state.screen!=='combat')return;if(c.delayedDamage){this.damagePlayer(c.delayedDamage);c.delayedDamage=0;}this.checkDeaths();if(this.state.screen==='combat')this.startTurn();this.emit();}
    resolveEnemies(){const c=this.state.combat;c.enemies.forEach(enemy=>{if(this.state.screen!=='combat'||enemy.dead)return;const def=S.enemyById[enemy.id],intent=def.pattern[enemy.intentIndex%def.pattern.length];this.resolveIntent(enemy,intent);enemy.intentIndex=(enemy.intentIndex+1)%def.pattern.length;});}
    resolveIntent(e,i){const c=this.state.combat,name=S.enemyById[e.id].name;this.log(`${name}: ${i.label}.`,'intent');
      if(i.type==='attack')this.damagePlayer(i.amount);
      else if(i.type==='defendAttack'){e.block+=i.block;this.damagePlayer(i.amount);}
      else if(i.type==='markFreshest'){const cards=c.hand.filter(x=>x.freshness!=null).sort((a,b)=>b.freshness-a.freshness);e.markedUid=cards[0]?.uid||null;}
      else if(i.type==='bruiseMarked'){const card=c.hand.find(x=>x.uid===e.markedUid);if(card)this.bruise(card,i.amount);e.markedUid=null;}
      else if(i.type==='bruiseOldest'){const x=this.oldestCard();if(x)this.bruise(x,i.amount);}
      else if(i.type==='bruiseAll')c.hand.filter(x=>x.freshness!=null).forEach(x=>this.bruise(x,i.amount));
      else if(i.type==='applyMold')c.status.mold+=i.amount;
      else if(i.type==='applySated')c.status.sated+=i.amount;
      else if(i.type==='attackPerRipe')this.damagePlayer(i.amount+c.hand.filter(x=>this.isRipe(x)).length*i.per);
      else if(i.type==='attackPerPlayed')this.damagePlayer(i.amount+c.playedThisTurn*i.per);
      else if(i.type==='tenderAttack'){c.status.tender=(c.status.tender||0)+1;this.damagePlayer(i.amount);}
      else if(i.type==='sealCostliest'){const x=c.hand.filter(x=>x.freshness!=null).sort((a,b)=>this.cardCost(b)-this.cardCost(a))[0];if(x)x.sealed++;}
      else if(i.type==='harvest'){for(let k=0;k<2;k++){const x=this.makeCombatCard({uid:this.uid++,id:'orchard_fruit'});x.drawnTurn=c.turn;c.hand.push(x);}if(i.attack)this.damagePlayer(i.attack);c.fruitPhase='Feast';}
      else if(i.type==='feast'){this.damagePlayer((i.base||0)+c.hand.filter(x=>x.id==='orchard_fruit').length*i.amount);c.fruitPhase='Famine';}
      else if(i.type==='famine'){this.damagePlayer(i.amount);c.famineNext=true;c.fruitPhase='Harvest';}
    }
    nextIntent(enemy){const d=S.enemyById[enemy.id];return d.pattern[enemy.intentIndex%d.pattern.length];}
    checkDeaths(){const c=this.state.combat;if(!c)return;c.enemies.forEach(e=>{if(e.hp<=0&&!e.dead){e.dead=true;e.hp=0;this.log(`${S.enemyById[e.id].name} is defeated.`,'system');}});if(c.enemies.every(e=>e.dead)){const boss=c.enemies.some(e=>S.enemyById[e.id].boss);this.state.run.hp=Math.max(1,this.state.run.hp);if(boss)this.finishRun(true);else if(this.state.run.tutorial)this.finishTutorial();else this.openReward();}}
    openReward(){const pool=S.cards.filter(c=>!['starter','token'].includes(c.rarity));const picks=[];while(picks.length<3){const c=this.rng.pick(pool);if(!picks.includes(c.id))picks.push(c.id);}this.state.combat=null;this.state.reward=picks;this.state.screen='reward';this.emit();}
    takeReward(id){if(id)this.state.run.deck.push({uid:this.uid++,id,upgraded:false,shelfBonus:0});else this.state.run.coin+=15;this.advanceMap();}
    advanceMap(){this.state.combat=null;this.state.reward=null;this.state.run.row++;if(this.state.run.row>=this.state.run.map.length)this.finishRun(true);else{this.state.screen='map';this.emit();}}
    finishRun(win){if(!this.state.run)return;this.state.combat=null;this.state.screen=win?'victory':'defeat';this.state.run.epilogue=this.state.run.stats.preserved>this.state.run.stats.rotConsumed?'You arrive with the cloth still cool. The House asks what, precisely, you meant to save.':'You arrive with clean plates and dark soil under every nail. The House opens like a mouth.';this.clearSave();this.emit(false);}
    tutorialEvent(type){const r=this.state.run;if(!r?.tutorial)return;const needed=['play','age','ripe','perish','consume'];if(needed[r.tutorialStep]===type)r.tutorialStep++;}
    tutorialTip(){const r=this.state.run;if(!r?.tutorial)return '';return ['Play a card by clicking it.','Leave a perishable card in hand, then end the turn to watch it age.','Hold Red Knife until it is Ripe, then play it for bonus damage.','Let a card reach 0 Freshness so it becomes Rot.','Play Scrape the Board after Rot exists.','Choose the reward that fits how you played.'][Math.min(r.tutorialStep,5)];}
    finishTutorial(){this.state.combat=null;this.state.screen='tutorialReward';this.emit();}
    finishTutorialChoice(id){this.clearSave();this.state={screen:'menu',run:null,combat:null,overlay:'tutorialDone',toast:''};this.emit(false);}

    openEvent(id){const event=id?S.eventById[id]:this.rng.pick(S.events);this.state.currentEvent=event.id;this.state.screen='event';this.emit();}
    chooseEvent(index){const ev=S.eventById[this.state.currentEvent],choice=ev.choices[index];if(choice)this.executeRunActions(choice.actions);this.advanceMap();}
    executeRunActions(actions){const r=this.state.run;(actions||[]).forEach(a=>{const t=a[0],n=a[1];
      if(t==='heal')r.hp=Math.min(r.maxHp,r.hp+n);else if(t==='healFull')r.hp=r.maxHp;else if(t==='coin')r.coin=Math.max(0,r.coin+n);else if(t==='damageRun')r.hp=Math.max(1,r.hp-n);else if(t==='nextBurden')r.nextCombatCards.push(n);else if(t==='nextStatus')r.nextStatus[n]=(r.nextStatus[n]||0)+a[2];else if(t==='relic')this.addRelic(n);else if(t==='upgradeRandom')this.upgradeRandom(n);else if(t==='upgradeShortest')this.upgradeCard(this.shortestDeckCard()?.uid);else if(t==='shelfRandom'){const p=r.deck.filter(x=>S.cardById[x.id].shelf!=null);if(p.length){const x=this.rng.pick(p);x.shelfBonus=(x.shelfBonus||0)+n;}}else if(t==='removeShortest'){const x=this.shortestDeckCard();if(x)r.deck.splice(r.deck.indexOf(x),1);}else if(t==='coinPerStable'){const count=r.deck.filter(x=>S.cardById[x.id].shelf==null).length;r.coin+=Math.min(a[2],count*n);}else if(t==='coinIfPerishable'){if(r.deck.filter(x=>S.cardById[x.id].shelf!=null).length>=n)r.coin+=a[2];}else if(t==='gainRare'){const p=S.cards.filter(x=>x.rarity==='rare');for(let i=0;i<n;i++)r.deck.push({uid:this.uid++,id:this.rng.pick(p).id,upgraded:false,shelfBonus:0});}else if(t==='relicIfSmall'){if(r.deck.length<=a[2])this.addRelic(n);}else if(t==='relicIfRot'){if(r.deck.some(x=>/consume/i.test(S.cardById[x.id].text)))this.addRelic(n);}else if(t==='tradeTagRelic'){const x=r.deck.find(x=>/Preserve|Seal/i.test(S.cardById[x.id].text));if(x){r.deck.splice(r.deck.indexOf(x),1);this.addRelic(a[2]);}}
    });}
    shortestDeckCard(){return this.state.run.deck.filter(x=>S.cardById[x.id].shelf!=null).sort((a,b)=>S.cardById[a.id].shelf-S.cardById[b.id].shelf)[0];}
    upgradeRandom(n){const pool=this.state.run.deck.filter(x=>!x.upgraded&&S.cardById[x.id].upgrade);for(let i=0;i<n&&pool.length;i++){const x=pool.splice(this.rng.int(pool.length),1)[0];x.upgraded=true;}}
    upgradeCard(uid){const x=this.state.run.deck.find(c=>c.uid===uid);if(x&&S.cardById[x.id].upgrade){x.upgraded=true;this.notify(`${S.cardById[x.id].name} upgraded.`);return true;}return false;}
    kitchenUpgrade(uid){if(this.upgradeCard(uid))this.advanceMap();}
    campHeal(){this.state.run.hp=Math.min(this.state.run.maxHp,this.state.run.hp+Math.ceil(this.state.run.maxHp*.2));this.advanceMap();}
    campUpgrade(){this.state.screen='kitchen';this.emit();}
    openMarket(){const cardPool=S.cards.filter(c=>!['starter','token'].includes(c.rarity));const relicPool=S.relics.filter(r=>!this.state.run.relics.includes(r.id));this.state.market={cards:[this.rng.pick(cardPool).id,this.rng.pick(cardPool).id,this.rng.pick(cardPool).id],relics:relicPool.length?[this.rng.pick(relicPool).id,this.rng.pick(relicPool).id]:[]};this.state.screen='market';this.emit();}
    buyCard(id){const cost=S.cardById[id].rarity==='rare'?75:S.cardById[id].rarity==='uncommon'?55:38;if(this.state.run.coin<cost)return this.notify('Not enough Coin.');this.state.run.coin-=cost;this.state.run.deck.push({uid:this.uid++,id,upgraded:false,shelfBonus:0});this.state.market.cards=this.state.market.cards.filter(x=>x!==id);this.emit();}
    buyRelic(id){const cost=95;if(this.state.run.coin<cost)return this.notify('Not enough Coin.');this.state.run.coin-=cost;this.addRelic(id);this.state.market.relics=this.state.market.relics.filter(x=>x!==id);this.emit();}
    addRelic(id){if(id&&!this.state.run.relics.includes(id))this.state.run.relics.push(id);}
    removeCard(uid){const cost=75+this.state.run.removals*25;if(this.state.run.coin<cost)return this.notify('Not enough Coin.');if(this.state.run.deck.length<=7)return this.notify('Your ledger cannot go below 7 cards.');const i=this.state.run.deck.findIndex(x=>x.uid===uid);if(i>=0){this.state.run.coin-=cost;this.state.run.removals++;this.state.run.deck.splice(i,1);this.emit();}}
    leaveMarket(){this.advanceMap();}
    openDeck(){this.state.overlay='deck';this.emit(false);}
    openSettings(){this.state.overlay='settings';this.emit(false);}
    closeOverlay(){this.state.overlay=null;this.emit(false);}
    debugAddCard(id){if(this.state.combat){const x=this.makeCombatCard({uid:this.uid++,id});x.drawnTurn=this.state.combat.turn;this.state.combat.hand.push(x);}else if(this.state.run)this.state.run.deck.push({uid:this.uid++,id,upgraded:false,shelfBonus:0});this.emit();}
    debugFight(id){if(this.state.run)this.startCombat([id]);}
    debugRelic(id){this.addRelic(id);this.emit();}
    debugEvent(id){if(this.state.run)this.openEvent(id);}
  }
  S.Game=Game;S.RNG=RNG;
})();
