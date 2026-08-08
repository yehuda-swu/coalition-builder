window.GAME_DATA = {
  title: "61: Build the Coalition",
  majority: 61,

  issues: {
    security: "Security and Palestinian issue",
    inquiry: "October 7 Inquiry",
    judicial: "Judicial Reform",
    arab: "Work with non Zionist Arab parties",
    charedi: "Charedi integration"
  },

  sectors: [
    {name:"All", icon:"◉", colour:"#082f5f"},
    {name:"Far Left", icon:"✊", colour:"#d1495b"},
    {name:"Left", icon:"🕊", colour:"#2a9d8f"},
    {name:"Right", icon:"🛡", colour:"#2f5ea8"},
    {name:"Far Right", icon:"⚑", colour:"#e67e22"},
    {name:"Ultra Orthodox Jewish", icon:"🎩", colour:"#7a4fa3"},
    {name:"Arab", icon:"عربي", colour:"#4c956c"}
  ],

  parties: [
    {
      id:"likud", name:"Likud", leader:"Bibi Netanyahu", seats:23, sector:"Right",
      logo:"assets/logos/likud.webp", photo:"assets/leaders/netanyahu.webp",
      leadership:"Requires Netanyahu",
      positions:{
        security:{stance:"Support",strength:"Red line"},
        inquiry:{stance:"Oppose",strength:"Flexible"},
        judicial:{stance:"Support",strength:"Flexible"},
        arab:{stance:"Oppose",strength:"Red line"},
        charedi:{stance:"Oppose",strength:"Flexible"}
      },
      veto:["democrats","joint_arab_list","raam"]
    },
    {
      id:"yashar", name:"Yashar", leader:"Gadi Eisenkot", seats:24, sector:"Left",
      logo:"assets/logos/yashar.png", photo:"assets/leaders/eisenkot.webp",
      leadership:"Refuses Netanyahu",
      positions:{
        security:{stance:"Flexible",strength:"Flexible"},
        inquiry:{stance:"Support",strength:"Flexible"},
        judicial:{stance:"Oppose",strength:"Flexible"},
        arab:{stance:"Oppose",strength:"Flexible"},
        charedi:{stance:"Support",strength:"Red line"}
      },
      veto:["otzma_yehudit","hatzionut_hadati"]
    },
    {
      id:"byachad", name:"B'Yachad", leader:"Naftali Bennett", seats:16, sector:"Right",
      logo:"assets/logos/byachad.webp", photo:"assets/leaders/bennett.webp",
      leadership:"Refuses Netanyahu",
      positions:{
        security:{stance:"Support",strength:"Flexible"},
        inquiry:{stance:"Support",strength:"Flexible"},
        judicial:{stance:"Oppose",strength:"Flexible"},
        arab:{stance:"Oppose",strength:"Flexible"},
        charedi:{stance:"Support",strength:"Red line"}
      },
      veto:["otzma_yehudit"]
    },
    {
      id:"democrats", name:"The Democrats", leader:"Yair Golan", seats:9, sector:"Far Left",
      logo:"assets/logos/democrats.webp", photo:"assets/leaders/golan.webp",
      leadership:"Refuses Netanyahu",
      positions:{
        security:{stance:"Support",strength:"Red line"},
        inquiry:{stance:"Support",strength:"Flexible"},
        judicial:{stance:"Oppose",strength:"Flexible"},
        arab:{stance:"Support",strength:"Red line"},
        charedi:{stance:"Support",strength:"Red line"}
      },
      veto:["likud","otzma_yehudit","hatzionut_hadati"]
    },
    {
      id:"yisrael_beitenu", name:"Yisrael Beitenu", leader:"Avigdor Lieberman", seats:11, sector:"Right",
      logo:"assets/logos/yisrael_beitenu.webp", photo:"assets/leaders/lieberman.webp",
      leadership:"Refuses Netanyahu",
      positions:{
        security:{stance:"Support",strength:"Flexible"},
        inquiry:{stance:"Support",strength:"Flexible"},
        judicial:{stance:"Oppose",strength:"Flexible"},
        arab:{stance:"Oppose",strength:"Flexible"},
        charedi:{stance:"Support",strength:"Red line"}
      },
      veto:["utj","shas"]
    },
    {
      id:"hatzionut_hadati", name:"Hatzionut HaDatit", leader:"Bezalel Smotrich", seats:4, sector:"Far Right",
      logo:"assets/logos/hatzionut_hadati.webp", photo:"assets/leaders/smotrich.webp",
      leadership:"Requires Netanyahu",
      positions:{
        security:{stance:"Support",strength:"Red line"},
        inquiry:{stance:"Oppose",strength:"Flexible"},
        judicial:{stance:"Support",strength:"Flexible"},
        arab:{stance:"Oppose",strength:"Red line"},
        charedi:{stance:"Support",strength:"Flexible"}
      },
      veto:["democrats","joint_arab_list","raam"]
    },
    {
      id:"otzma_yehudit", name:"Otzma Yehudit", leader:"Itamar Ben Gvir", seats:8, sector:"Far Right",
      logo:"assets/logos/otzma_yehudit.webp", photo:"assets/leaders/ben_gvir.webp",
      leadership:"Requires Netanyahu",
      positions:{
        security:{stance:"Support",strength:"Red line"},
        inquiry:{stance:"Oppose",strength:"Flexible"},
        judicial:{stance:"Support",strength:"Flexible"},
        arab:{stance:"Oppose",strength:"Red line"},
        charedi:{stance:"Oppose",strength:"Flexible"}
      },
      veto:["democrats","joint_arab_list","raam"]
    },
    {
      id:"utj", name:"UTJ", leader:"Moshe Gafni and Yitzhak Goldknopf", seats:8, sector:"Ultra Orthodox Jewish",
      logo:"assets/logos/utj.webp", photo:"assets/leaders/gafni_goldknopf.webp",
      leadership:"Flexible",
      positions:{
        security:{stance:"Support",strength:"Flexible"},
        inquiry:{stance:"Flexible",strength:"Flexible"},
        judicial:{stance:"Flexible",strength:"Flexible"},
        arab:{stance:"Support",strength:"Flexible"},
        charedi:{stance:"Oppose",strength:"Red line"}
      },
      veto:["yisrael_beitenu","yashar","byachad","democrats"]
    },
    {
      id:"shas", name:"Shas", leader:"Arye Deri", seats:7, sector:"Ultra Orthodox Jewish",
      logo:"assets/logos/shas.webp", photo:"assets/leaders/deri.webp",
      leadership:"Flexible",
      positions:{
        security:{stance:"Support",strength:"Flexible"},
        inquiry:{stance:"Flexible",strength:"Flexible"},
        judicial:{stance:"Flexible",strength:"Flexible"},
        arab:{stance:"Support",strength:"Flexible"},
        charedi:{stance:"Oppose",strength:"Red line"}
      },
      veto:["yisrael_beitenu","yashar","byachad","democrats"]
    },
    {
      id:"joint_arab_list", name:"Joint Arab List", leader:"Youssef Jabareen", seats:5, sector:"Arab",
      logo:"assets/logos/joint_arab_list.webp", photo:"assets/leaders/jabareen.webp",
      leadership:"Refuses Netanyahu",
      positions:{
        security:{stance:"Support",strength:"Red line"},
        inquiry:{stance:"Flexible",strength:"Flexible"},
        judicial:{stance:"Flexible",strength:"Flexible"},
        arab:{stance:"Support",strength:"Red line"},
        charedi:{stance:"Flexible",strength:"Flexible"}
      },
      veto:["likud","otzma_yehudit","hatzionut_hadati"]
    },
    {
      id:"raam", name:"Ra'am", leader:"Mansour Abbas", seats:5, sector:"Arab",
      logo:"assets/logos/raam.webp", photo:"assets/leaders/abbas.webp",
      leadership:"Refuses Netanyahu",
      positions:{
        security:{stance:"Support",strength:"Red line"},
        inquiry:{stance:"Flexible",strength:"Flexible"},
        judicial:{stance:"Flexible",strength:"Flexible"},
        arab:{stance:"Support",strength:"Red line"},
        charedi:{stance:"Flexible",strength:"Flexible"}
      },
      veto:["likud","otzma_yehudit","hatzionut_hadati"]
    }
  ]
};
