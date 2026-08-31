// THE GRANARY — Wedding Brochure Package Guide V2
(function(){
  const G={source:'Wedding Brochure · Packages pages 04-05 · supplied 2026-08-24'};

  G.standard=[
    {key:'privateBar',label:'Use of Private Bar',area:'Package'},
    {key:'masterOfCeremonies',label:'Master of Ceremonies',area:'Coordination'},
    {key:'cakeStandKnife',label:'Cake Stand & Knife',area:'Cake'},
    {key:'chairCovers',label:'Chair Covers with your choice of sash',area:'Décor'},
    {key:'tableNumbers',label:'Table Numbers & Stands',area:'Room Setup'},
    {key:'tableLinen',label:'White Table Linen',area:'Room Setup'},
    {key:'linenNapkins',label:'White Linen Napkins',area:'Room Setup'},
    {key:'discountedRooms',label:'Discounted Hotel Rooms for your wedding guests',area:'Bedrooms'},
    {key:'loveLetters',label:'LOVE Letters',area:'Décor'},
    {key:'residentDj',label:'Resident DJ & Disco',area:'Music'}
  ];

  G.packages={
    Evergreen:{
      subtitle:'Romantic & Refined',
      guestBasis:'60 Evening Guests',
      own:[
        {key:'eveningBuffet',label:'Hog Roast or an Evening Buffet',area:'Food',category:'eveningFood'},
        {key:'welcomeProsecco',label:'Welcome Glass of Prosecco',area:'Drinks',category:'welcomeDrink'},
        {key:'hexagon',label:'Floral White Wooden Hexagon',area:'Décor'},
        {key:'centrepieces',label:'Table Centre Pieces',area:'Décor'},
        {key:'lightCurtain',label:'Light Curtain',area:'Décor'},
        {key:'bridalSuite',label:'Bridal Suite evening of your wedding',area:'Bedrooms'},
        {key:'breakfastFollowing',label:'Breakfast following morning',area:'Bedrooms'}
      ],
      notes:['Not available on Saturdays','Option to add ceremony - £400.00']
    },
    Blossom:{
      subtitle:'Timeless & Elegant',
      guestBasis:'50 Day Guests & 100 Night Guests',
      inherits:'Evergreen',
      own:[
        {key:'twoCourse',label:'Two Course - Carvery & Cake',area:'Food',category:'dayMeal'},
        {key:'silverDrinks',label:'Silver Drinks Package',area:'Drinks',category:'mealDrinks',
          detail:'Glass of Prosecco for toast drink; glass of wine or bottle of beer per person'},
        {key:'postbox',label:'Postbox for letters',area:'Décor'},
        {key:'allDayRoomHire',label:'All Day Room Hire',area:'Venue'},
        {key:'civilCeremony',label:'Civil Ceremony',area:'Ceremony'}
      ],
      notes:[]
    },
    Willow:{
      subtitle:'Luxury & Indulgent',
      guestBasis:'50 Day Guests & 100 Night Guests',
      inherits:'Blossom',
      own:[
        {key:'threeCourse',label:'Three Course Meal',area:'Food',category:'dayMeal'},
        {key:'goldDrinks',label:'Gold Drinks Package',area:'Drinks',category:'mealDrinks',
          detail:'Glass of Prosecco for toast drink; half a bottle of wine, or two bottles of beer per person'},
        {key:'canapes',label:'Canapés served after ceremony',area:'Food'},
        {key:'moodLighting',label:'Mood Lighting',area:'Décor'},
        {key:'weddingCake',label:'Wedding Cake',area:'Cake'},
        {key:'allDayRoomHireWillow',label:'All Day Room Hire',area:'Venue'}
      ],
      notes:[]
    }
  };

  G.packageItems=function(name){
    const p=G.packages[name]; if(!p)return [];
    const inherited=p.inherits?G.packageItems(p.inherits):[];
    const merged=[...inherited];
    for(const item of p.own){
      // A higher package replaces the inherited entitlement in the same category.
      // Example: Willow Three Course replaces Blossom Two Course;
      // Willow Gold Drinks replaces Blossom Silver Drinks.
      if(item.category){
        for(let i=merged.length-1;i>=0;i--){
          if(merged[i].category===item.category)merged.splice(i,1);
        }
      }
      const duplicateIndex=merged.findIndex(x=>x.label.toLowerCase()===item.label.toLowerCase());
      if(duplicateIndex>=0)merged.splice(duplicateIndex,1);
      merged.push(item);
    }
    return merged;
  };
  G.allIncluded=function(name){
    const merged=[...G.standard,...G.packageItems(name)];
    const seen=new Set();
    return merged.filter(x=>{const k=x.label.toLowerCase();if(seen.has(k))return false;seen.add(k);return true;});
  };

  G.selectedArrangements=function(name,draft,reception){
    const out=[];
    const add=(label,value)=>{
      const s=String(value||'').trim();
      if(s&&!['none','n/a','not required','tbc'].includes(s.toLowerCase()))out.push({label,value:s});
    };
    if(name==='Willow'){
      add('Three course menu selection',draft?.menu||reception?.weddingBreakfastMenu);
      add('Gold drinks selection',draft?.drinks||reception?.drinksPackage);
      add('Evening food selection',draft?.eveningFood||reception?.eveningFoodMenu);
    }else if(name==='Blossom'){
      add('Two course menu selection',draft?.menu||reception?.weddingBreakfastMenu);
      add('Silver drinks selection',draft?.drinks||reception?.drinksPackage);
      add('Evening food selection',draft?.eveningFood||reception?.eveningFoodMenu);
    }else if(name==='Evergreen'){
      add('Evening food selection',draft?.eveningFood||reception?.eveningFoodMenu);
      add('Welcome drink arrangement',reception?.drinksPackage);
    }
    return out;
  };
  G.info=function(name){return G.packages[name]||null;};

  // Guided package-planning choices. These write normal human-readable text into
  // the existing Planning fields, so PDFs, Prep and historic records keep working
  // without a schema change. Staff can still edit the wording underneath.
  G.planningPresets={
    eveningFoodPackageChoice:[
      {label:'Hog Roast',value:'Hog Roast'},
      {label:'Evening Buffet',value:'Evening Buffet'},
      {label:'To be confirmed',value:'To be confirmed'}
    ],
    welcomeProseccoDetails:[
      {label:'Prosecco + alcohol-free',value:'Prosecco with non-alcoholic alternatives'},
      {label:'Prosecco only',value:'Prosecco for adult guests'},
      {label:'Alcohol-free only',value:'Non-alcoholic welcome drinks only'},
      {label:'Custom split',value:'Mixed Prosecco / non-alcoholic split — confirm quantities'}
    ],
    hexagonDetails:[
      {label:'Ceremony backdrop',value:'WMF floral white hexagon — ceremony backdrop'},
      {label:'Behind top table',value:'WMF floral white hexagon — behind top table'},
      {label:'Evening feature',value:'WMF floral white hexagon — evening feature backdrop'},
      {label:'Couple styling it',value:"WMF floral white hexagon — couple adding own styling"},
      {label:'Not required',value:'Not required'}
    ],
    centrepieceDetails:[
      {label:'WMF included',value:'WMF included centrepieces'},
      {label:'WMF + colour styling',value:'WMF included centrepieces — customise to wedding colour scheme'},
      {label:"Couple's own",value:"Couple's own centrepieces"},
      {label:'External florist',value:'External florist / supplier centrepieces'},
      {label:'Bespoke WMF',value:'Bespoke WMF centrepiece arrangement'},
      {label:'Not required',value:'Not required'}
    ],
    lightCurtainDetails:[
      {label:'Behind top table',value:'WMF light curtain — behind top table'},
      {label:'Ceremony backdrop',value:'WMF light curtain — ceremony backdrop'},
      {label:'In front of kitchen',value:'WMF light curtain — in front of kitchen'},
      {label:'Evening backdrop',value:'WMF light curtain — evening backdrop'},
      {label:'Not required',value:'Not required'}
    ],
    loveLettersPosition:[
      {label:'Behind top table',value:'WMF LOVE letters — behind top table'},
      {label:'Beside light curtain',value:'WMF LOVE letters — beside light curtain'},
      {label:'Dancefloor feature',value:'WMF LOVE letters — dancefloor feature'},
      {label:'Evening reception',value:'WMF LOVE letters — evening reception'},
      {label:'Not required',value:'Not required'}
    ],
    postboxDetails:[
      {label:'WMF cream postbox',value:'WMF cream postbox'},
      {label:"Couple's own",value:"Couple's own postbox"},
      {label:'External / bespoke',value:'External / bespoke postbox arrangement'},
      {label:'Not required',value:'Not required'}
    ],
    moodLightingDetails:[
      {label:'Match colour scheme',value:'Mood lighting — match wedding colour scheme'},
      {label:'Warm / neutral',value:'Mood lighting — warm neutral setting'},
      {label:'Bespoke colour',value:'Mood lighting — bespoke colour, see notes'},
      {label:'Not required',value:'Not required'}
    ],
    weddingCakeDetails:[
      {label:'WMF included cake',value:'WMF included wedding cake'},
      {label:'Couple supplying cake',value:'Couple supplying own wedding cake'},
      {label:'External cake supplier',value:'External wedding cake supplier'},
      {label:'Bespoke arrangement',value:'Bespoke wedding cake arrangement'},
      {label:'Not required',value:'Not required'}
    ]
  };

  // Planning is intentionally lean: the package engine knows every brochure entitlement,
  // but this screen only asks for decisions that genuinely need wedding-specific input.
  G.planningFields=function(name){
    const evergreen=[
      ['eveningFoodPackageChoice','Included evening food choice','select:Hog Roast|Evening Buffet|To be confirmed'],
      ['welcomeProseccoDetails','Welcome drinks — Prosecco / non-alcoholic split or notes','textarea'],
      ['hexagonDetails','Floral wooden hexagon — use / position / styling','textarea'],
      ['centrepieceDetails','Centre pieces — included design / own / bespoke arrangement','textarea'],
      ['lightCurtainDetails','Light curtain — use / position','textarea'],
      ['loveLettersPosition','LOVE Letters — use / position','text']
    ];
    const blossom=[
      ['postboxDetails','Postbox — included postbox / own / not required','textarea']
    ];
    const willow=[
      ['canapesTime','Canapés service time','time'],
      ['canapesDetails','Canapés — selection / service notes','textarea'],
      ['moodLightingDetails','Mood lighting — colour / preference','textarea'],
      ['weddingCakeDetails','Wedding cake — included cake details or own cake arrangement','textarea']
    ];
    if(name==='Willow')return [...evergreen,...blossom,...willow];
    if(name==='Blossom')return [...evergreen,...blossom];
    if(name==='Evergreen')return evergreen;
    return [];
  };

  window.WeddingPackageGuide=G;
})();