(function () {
  const S = (window.SPOILAGE = window.SPOILAGE || {});
  S.events = [
    {id:'wedding_pantry',name:'The Wedding Pantry',body:'The cake is old enough to remember the vows. It has kept better than the marriage.',choices:[
      {label:'Eat the preserved cake',risk:'Safe — heal 14; add a Sated Burden to the next combat.',actions:[['heal',14],['nextBurden','sated_burden']]},
      {label:'Trade a Ripe recipe',risk:'Deck check — gain 28 Coin if your deck has 5+ perishable cards.',actions:[['coinIfPerishable',5,28]]},
      {label:'Open the oldest jar',risk:'High change — upgrade a random card, lose 8 HP.',actions:[['upgradeRandom',1],['damageRun',8]]}
    ]},
    {id:'factor_scale',name:'The Factor’s Scale',body:'The brass pans know the weight of tomorrow’s disappointment.',choices:[
      {label:'Sell honest weight',risk:'Safe — gain 18 Coin.',actions:[['coin',18]]},
      {label:'Weigh your Stable cards',risk:'Deck check — 6 Coin per Stable card, up to 30.',actions:[['coinPerStable',6,30]]},
      {label:'Put your hand on the scale',risk:'Risk — lose 10 HP; gain a rare card.',actions:[['damageRun',10],['gainRare',1]]}
    ]},
    {id:'blue_beehive',name:'The Blue Beehive',body:'The bees have made wax the color of rain. They object to accounting.',choices:[
      {label:'Leave a spoonful of jam',risk:'Safe — heal 10.',actions:[['heal',10]]},
      {label:'Offer a preservation card',risk:'Deck check — remove one preservation card; gain Bee’s Wax.',actions:[['tradeTagRelic','preserve','bees_wax']]},
      {label:'Reach into the hive',risk:'Risk — lose 12 HP; gain Bee’s Wax and 20 Coin.',actions:[['damageRun',12],['relic','bees_wax'],['coin',20]]}
    ]},
    {id:'keeper_well',name:'The Keeper’s Well',body:'Cold air rises from it carrying labels in several dead handwritings.',choices:[
      {label:'Drink from the bucket',risk:'Safe — heal 12.',actions:[['heal',12]]},
      {label:'Lower a short-lived card',risk:'Deck check — add +1 Shelf Life to a random perishable card.',actions:[['shelfRandom',1]]},
      {label:'Lower the whole ledger',risk:'Risk — lose 15 Coin; upgrade two random cards.',actions:[['coin',-15],['upgradeRandom',2]]}
    ]},
    {id:'table_picnic',name:'The Table’s Picnic',body:'Every place is set. No guest has waited for you, which is the polite way to wait.',choices:[
      {label:'Take bread for the road',risk:'Safe — gain 15 Coin.',actions:[['coin',15]]},
      {label:'Serve your shortest-lived card',risk:'Deck check — remove it; heal 18.',actions:[['removeShortest',1],['heal',18]]},
      {label:'Eat until the plates shine',risk:'Risk — heal fully; add 2 Sated Burdens.',actions:[['healFull'],['nextBurden','sated_burden'],['nextBurden','sated_burden']]}
    ]},
    {id:'mold_librarian',name:'The Mold Librarian',body:'The blue bloom has indexed every page except the useful ones.',choices:[
      {label:'Return a book unopened',risk:'Safe — gain 12 Coin.',actions:[['coin',12]]},
      {label:'Read the damp chapter',risk:'Deck check — gain Silver Mold if you have a Rot consumer.',actions:[['relicIfRot','silver_mold']]},
      {label:'Correct the catalog',risk:'Risk — gain 2 Mold next combat; gain a rare card.',actions:[['nextStatus','mold',2],['gainRare',1]]}
    ]},
    {id:'fallen_bell',name:'The Fallen Dinner Bell',body:'It rings when the wind remembers supper.',choices:[
      {label:'Polish the bell',risk:'Safe — gain 20 Coin.',actions:[['coin',20]]},
      {label:'Ring with an empty hand',risk:'Deck check — if deck is 14 cards or fewer, gain Dinner Bell.',actions:[['relicIfSmall','dinner_bell',14]]},
      {label:'Ring it three times',risk:'Risk — lose 15 HP; gain Dinner Bell and upgrade a card.',actions:[['damageRun',15],['relic','dinner_bell'],['upgradeRandom',1]]}
    ]},
    {id:'last_hedge',name:'The Last Hedge',body:'Past it, the orchard owns the road. The hedge requests a small administrative sacrifice.',choices:[
      {label:'Pay the toll',risk:'Safe — lose 12 Coin.',actions:[['coin',-12]]},
      {label:'Prune with a Ripe card',risk:'Deck check — upgrade your oldest perishable card.',actions:[['upgradeShortest',1]]},
      {label:'Walk through the thorns',risk:'Risk — lose 11 HP; gain 35 Coin.',actions:[['damageRun',11],['coin',35]]}
    ]}
  ];
  S.eventById = Object.fromEntries(S.events.map(e => [e.id,e]));
})();
