function getQueryVariable(){for(var a="startAt",b=window.location.search.substring(1),c=b.split("&"),d=0;d<c.length;d++){var e=c[d].split("=");if(decodeURIComponent(e[0])==a)return decodeURIComponent(e[1])}return null}var krpano=null,panoDiv=null,contextMap=null,pause=function(a){krpano.call("breakall()"),(!contextMap.getLastClick()||(new Date).getTime()-contextMap.getLastClick()>10)&&(krpano.call("pause(false);"),contextMap.pause())};initClimbMode=function(a){krpano=document.getElementById("krpanoSWFObject"),panoDiv=document.getElementById("pano");var b=getQueryVariable()?getQueryVariable():1;krpano.call("set(panoNumber,"+b+");"),krpano.call("setupDemoMode();"),krpano.call("set(mountain, "+a+");"),krpano.call("set(lastPano, "+campInfo[campInfo.length-1].panoNumber+");");var c=krpano.clientWidth<768;krpano.call("set(mobileView, "+c+");"),krpano.call("pause(true)"),paused=!0;var d=function(a){krpano.call("breakall()");var b=a.keyCode;32==b&&(paused=!paused,paused?contextMap.pause():contextMap.unpause())};document.ontouchstart=pause,document.onclick=pause,document.addEventListener("keydown",d,!1),contextMap=new ContextMap("contextMap",{topMargin:.025,bottomMargin:.05,sideMargin:.1,buttonWidth:.1,campInfo:campInfo},a),contextMap.initialize()},setCampVariables=function(a){for(var b=0,c=0,d=parseInt(a),e=0;e<campInfo.length&&(b=c,c=campInfo[e].panoNumber,!(c>a));e++);krpano.call("set(nextCamp,"+c+");"),krpano.call("set(prevCamp,"+b+");");var f="",g="",h="";"undefined"!=typeof cacheBusters&&"img"in cacheBusters&&(d in cacheBusters.img&&(f=cacheBusters.img[d]),d+1 in cacheBusters.img&&(g=cacheBusters.img[d+1]),d-1 in cacheBusters.img&&(h=cacheBusters.img[d-1])),krpano.call("set(imgCacheBuster,"+f+");"),krpano.call("set(nextImgCacheBuster,"+g+");"),krpano.call("set(prevImgCacheBuster,"+h+");"),krpano.call("preloadWrapper()"),contextMap.updateCurrentPosition(d),contextMap.update()};var ContextMap=function(a,b,c){function d(a){return a in document.documentElement.style}var e=d("MozBoxSizing")?"-moz-":d("WebkitTransform")?"-webkit-":"",f=window.devicePixelRatio||1,g=document.getElementById(a).getContext("2d"),h=g.webkitBackingStorePixelRatio||g.mozBackingStorePixelRatio||g.msBackingStorePixelRatio||g.oBackingStorePixelRatio||g.backingStorePixelRatio||1,i=f/h,j=Math.max.apply(null,campInfo.map(function(a){return a.elevation}))-Math.min.apply(null,campInfo.map(function(a){return a.elevation})),k=b.campInfo[b.campInfo.length-1].panoNumber,l=null,m=[],n=[],o=[],p=null,q=campInfo[campInfo.length-1].panoNumber,r=function(a){m.push(a),s.addChild(a)},s=new createjs.Stage(document.getElementById(a));s.enableMouseOver(10),s.canvas.height=canvasHeight=.33*krpano.clientHeight,s.canvas.width=canvasWidth=.33*krpano.clientWidth,s.on("mouseover",function(){t.alpha=.35,p.alpha=.65,s.update()}),s.on("mouseout",function(){t.alpha=.2,p.alpha=.5,s.update()});var t=new createjs.Shape;t.graphics.beginFill("rgba(37,37,37,1").drawRect(0,0,canvasWidth,(1-b.topMargin)*canvasHeight),t.alpha=.2,t.originalDimensions={width:canvasWidth,height:(1-b.topMargin)*canvasHeight},t.y=canvasHeight-t.scaleY*t.originalDimensions.height,t.resize=function(a){t.scaleY*=a.y,t.scaleX*=a.x,t.y=canvasHeight-t.scaleY*t.originalDimensions.height},r(t);var u=new createjs.Container;u.on("click",function(a){P(!1),l=(new Date).getTime()});var v=new createjs.Shape;v.originalDimensions={width:b.buttonWidth*canvasWidth,height:2*b.topMargin*canvasHeight},v.graphics.beginFill("gray").beginStroke("black").drawRect(0,0,v.originalDimensions.width,v.originalDimensions.height),u.addChild(v),u.cursor="pointer",u.z=750,u.getBox=function(){return u.children[0]},u.drawArrow=function(){u.removeChild(u.children[1]);var a=new createjs.Shape;a.graphics.beginStroke("black").setStrokeStyle(2),D?(a.graphics.moveTo(.25*v.originalDimensions.width,.25*v.originalDimensions.height),a.graphics.lineTo(.5*v.originalDimensions.width,.75*v.originalDimensions.height),a.graphics.lineTo(.75*v.originalDimensions.width,.25*v.originalDimensions.height)):(a.graphics.moveTo(.25*v.originalDimensions.width,.75*v.originalDimensions.height),a.graphics.lineTo(.5*v.originalDimensions.width,.25*v.originalDimensions.height),a.graphics.lineTo(.75*v.originalDimensions.width,.75*v.originalDimensions.height)),u.addChild(a)},u.resize=function(a){u.scaleX*=a.x,u.scaleY*=a.y,u.regX=u.getBox().originalDimensions.width*u.scaleX/2,u.x=canvasWidth/2,D?u.y=0:u.y=(1-3.5*b.bottomMargin)*canvasHeight,u.drawArrow()},r(u);var w=new createjs.Shape;w.graphics.setStrokeStyle(2).beginStroke("black").beginFill("rgba(229,61,0,1)").drawCircle(0,0,9),w.z=201,w.on("pressmove",function(a){w.x=Math.min(a.stageX,n[n.length-1].x),w.x=Math.max(a.target.x,n[0].x),(D||E)&&O(),s.update(),document.body.style.cursor=e+"grabbing",w.cursor=e+"grabbing"}),w.cursor=e+"grab",w.on("pressup",function(){var a="";"undefined"!=typeof cacheBusters&&"img"in cacheBusters&&c in cacheBusters.img&&(a=cacheBusters.img[c]);var c=Math.round((w.x-b.sideMargin*canvasWidth)/((1-2*b.sideMargin)*canvasWidth)*k);krpano.call("loadPanoWrapper("+c+", false, false,"+a+")"),pause(),document.body.style.cursor="default",w.cursor=e+"grab"}),s.addChild(w);var x=new createjs.Shape;x.graphics.f("white").p("EBjOBGUIEOAAIAAA8IhkAAIAADIIhQAAIAAjIIhaAAIAAg8").cp().ef().f("white").p("EBxwBGUIBQAAIAAEEIhQAAIAAkE").cp().ef().f("white").p("EBz8BGUIBQAAIAADIICgAAIAAA8IjwAAIAAkE").cp().ef().f("white").p("EB48BKiIC0AAIFAjIIigC+IGQAAIjIlKIocFU").cp().ef().f("white").p("EBh+BOmIiCDmIAAlyIGQAAIAACMIiCAAIAKR0IiMAAIgKx0").cp().ef().f("white").p("EBncBMaICCAAIAAUAIiCAAIAA0A").cp().ef().f("white").p("EBs6BOcIiCAAIAAiCIGGAAIAACCIiCAAIAAR+IiCAAIAAx+").cp().ef().f("white").p("EB6qBMaIB4AAYAyEOA8EEAoEiIAKAAYgKhugKjmAAhuIAAlyICCAAIAAUAIh4AAYgykOhGkEgokiIAAAAYAKBuAKDmAABuIAAFyIiCAAIAA0A").cp().ef().f("white").p("ECCyBbQICMAAIAADIICCAAIAAm4IiCAAYhQAAg8g8AAhQIAAl8YAAhuBahaBuAAYBuAABaBaAABuIAACMIiCAAIAAjIIiCAAIAAG4ICCAAYBGAAA8A8AABQIAAF8YAABuhaBahuAAYhuAAhahaAAhuIAAiM").cp().ef().f("white").p("EB1WBMQYhkAAhaBaAABuIAARCICCAAIAAo6IAAAAIAApEICCAAIAAJEIAAAAIAAI6ICCAAIAAxCYAAhuhahahuAA").cp().ef().f("white").p("EBzyBVeIAACCIC+AAIAAiCIi+AA").cp().ef().f("white").p("EBvuBGUIhkAAIhuEEIBaAAIAKgoIA8iWIAyCWIAUAoIBaAAIhukE").cp().ef().f("white").p("EBwMBJwIgeg8IhaAAIgeA8ICWAA").cp().ef().f("white").p("EBsIBJIYAAgegKgKgUgKIAAAAYAUAAAUgUAAgoYAAgogUgeg8AAIjSAAIAAA8IBaAAIBQAAYAUAAAKAKAAAUYAAAUgKAKgUAAIhQAAIhaAAIAACMIBaAAIAAhaIBQAAYAUAAAKAKAAAoYAAAKAAAUAKAKIBaAAYgKgUAAgKgKgy").cp().ef().f("white").p("EBnwBIWIBaAAIAAhQIhaAAIAABQ").cp().ef(),x.regX=874,x.regY=616,x.z=50,x.scaleX=x.scaleY=1,x.originalDimensions={x:227,y:150},x.resize=function(){x.x=(1-2*b.sideMargin)*canvasWidth,x.y=(1-2*b.bottomMargin)*canvasHeight,"buriedtreasure"==c&&(x.x=(1-.5*b.sideMargin)*canvasWidth,x.y=4*b.bottomMargin*canvasHeight),canvasWidth>x.originalDimensions.x/x.originalDimensions.y*canvasHeight?x.scaleY=x.scaleX=.15*canvasHeight/x.originalDimensions.y:x.scaleX=x.scaleY=.15*canvasWidth/x.originalDimensions.x},r(x);var y=function(){var a=new createjs.Shape;return a.graphics.f("rgba(37, 37, 37, 1)").p("EB8YBncYAAJOngHqpYAAYpYAAngnqAApOYAApYHgnqJYAAYJYAAHgHqAAJY").cp().ef().f("rgba(255,255,255,1)").p("EBzoBnIIsqnCYAAAAgKAAgKAAYAAAAAAAAAAAKIAAOEIAAAKYAKAAAAAAAAAAYAKAAAAAAAAAAIMqnCYAKAAAAgKAAAAYAAAAAAgKgKAA").cp().ef(),a.alpha=.5,a.regX=580,a.regY=662,a.scaleX=a.scaleY=.1*canvasWidth/125,a.on("click",function(){l=(new Date).getTime(),G()}),a.on("mouseover",function(){a.alpha=1,B.x=C.x=a.x+221*a.scaleX+5,B.y=C.y=a.y-B.getMetrics().height/2,B.visible=C.visible=!0,s.update()}),a.on("mouseout",function(){a.alpha=.5,B.visible=C.visible=!1,s.update()}),a.cursor="pointer",a},z=y(),A=y(),B=new createjs.Text("Climb","22px Arial","white");B.z=1001,B.visible=!1;var C=new createjs.Text("Climb","22px Arial","black");C.z=1e3,C.outline=1,C.visible=!1,s.addChild(B),s.addChild(C),A.resize=function(a){A.x=0,A.y=.5*canvasHeight,A.scaleX=A.scaleY=.6},z.resize=function(a){z.x=b.sideMargin*canvasWidth,z.y=.35*canvasHeight,"buriedtreasure"==c&&(z.x=(1-2*b.sideMargin)*canvasWidth,z.y=.4*canvasHeight),z.scaleX=z.scaleY*=a.x},"buriedtreasure"==c&&z.on("mouseover",function(){z.alpha=1,B.x=C.x=z.x-B.getMetrics().width-5,B.y=C.y=z.y-B.getMetrics().height/2,B.visible=C.visible=!0,s.update()}),r(A),r(z);var D=!0,E=!1,F=1,G=function(){q>F&&(krpano.call("breakall"),paused=!1,z.visible=A.visible=!1,s.update(),document.getElementById("clickToPause").style.display="block",setTimeout(function(){document.getElementById("clickToPause").style.display="none",krpano.call("loadNextPano(true, false);")},1e3))};this.pause=function(){krpano.call("pause(false);"),F!=q&&(z.visible=A.visible=!0),s.update(),paused=!0},this.unpause=G,this.initialize=function(){K(),J(),window.addEventListener("resize",J)},this.getLastClick=function(){return l},this.update=function(){F==q&&(z.visible=A.visible=!1),s.update()};var H=function(){s.addChild(A),s.removeChild(z)},I=function(){s.removeChild(A),s.addChild(z),u.visible=!0},J=function(){var a=.33*krpano.clientHeight*i,b=.33*krpano.clientWidth*i;I();var c=!1;if(krpano.clientWidth<768){H(),c=!0;var a=.5*krpano.clientHeight*i,b=.5*krpano.clientWidth*i}var d={y:a/s.canvas.height,x:b/s.canvas.width};s.canvas.width=canvasWidth=b,s.canvas.height=canvasHeight=a,s.canvas.style.width=b/i+"px",s.canvas.style.height=a/i+"px",g.scale(i,i);for(var e in m)m[e].resize(d);for(var f in n)L(n[f],f==n.length-1,c);M(),N(c),krpano.clientWidth<768&&D?P(!0):s.update()},K=function(){for(var a in b.campInfo){var c=new createjs.Shape;c.campInfo=b.campInfo[a],a==b.campInfo.length-1?(c.mapUpGraphic=new createjs.Graphics,c.mapUpGraphic.beginStroke("black").beginFill("darkgray").drawCircle(0,0,10),c.mapDownGraphic=new createjs.Graphics,c.mapDownGraphic.f("rgba(229,61,0,254)").ss(3).s("rgba(0,0,0,254)").p("EAwcBguIHMgKIMgn+ImQH0IPogUIn+sqI1GNS").cp().ef().es(),c.graphics.beginStroke("black").beginFill("darkgray").drawCircle(0,0,10)):c.graphics.beginStroke("black").beginFill("darkgray").drawCircle(0,0,10),L(c),n.push(c),c.z=200,c.cursor="pointer",c.on("click",function(a,b){var c="";"undefined"!=typeof cacheBusters&&"img"in cacheBusters&&b in cacheBusters.img&&(c=cacheBusters.img[b]),krpano.call("loadPanoWrapper("+b+", false, false,"+c+")")},null,!1,c.campInfo.panoNumber);var d=new createjs.Text(c.campInfo.name+"\n"+c.campInfo.elevation+" m","22px Arial","white");d.x=c.x,d.y=c.y,d.z=1001,d.visible=!1;var e=new createjs.Text(c.campInfo.name+"\n"+c.campInfo.elevation+" m","22px Arial","black");e.x=c.x,e.y=c.y,e.z=1e3,e.outline=1,e.visible=!1,s.addChild(e),s.addChild(d),c.on("mouseover",function(a,c){var d=c.textObj.getMetrics();c.textObj.x=c.markerObj.x-d.width/2,c.textOutlineObj.x=c.markerObj.x-d.width/2,c.textObj.y=c.markerObj.y-10-d.height,c.textOutlineObj.y=c.markerObj.y-10-d.height,c.textObj.x<0&&(c.textObj.x=0,c.textOutlineObj.x=0),c.textObj.x+d.width>(1-b.sideMargin)*s.canvas.width&&(c.textObj.x=(1-b.sideMargin)*s.canvas.width-d.width-1,c.textOutlineObj.x=(1-b.sideMargin)*s.canvas.width-d.width-1),c.textObj.y<b.topMargin*s.canvas.height&&(c.textObj.y=b.topMargin*s.canvas.height,c.textOutlineObj.y=b.topMargin*s.canvas.height),c.textObj+d.height>s.canvas.height&&(c.textObj.y=s.canvas.height-d.height-1,c.textOutlineObj.y=s.canvas.height-d.height-1),c.textObj.visible=!0,c.textOutlineObj.visible=!0,s.update()},null,!1,{textObj:d,textOutlineObj:e,markerObj:c}),c.on("mouseout",function(a,b){b.textObj.visible=!1,b.textOutlineObj.visible=!1,s.update()},null,!1,{textObj:d,textOutlineObj:e}),s.addChild(c)}},L=function(a,c,d){a.elevation=(1-b.bottomMargin)*canvasHeight-(a.campInfo.elevation-b.campInfo[0].elevation)/j*.85*canvasHeight,D?a.y=a.elevation:a.y=(1-b.bottomMargin)*canvasHeight,a.x=a.campInfo.panoNumber/k*(1-2*b.sideMargin)*canvasWidth+b.sideMargin*canvasWidth,c&&!D?d?canvasHeight>canvasWidth?a.scaleX=a.scaleY=.25*canvasWidth/250:a.scaleX=a.scaleY=.25*canvasHeight/250:a.scaleX=a.scaleY=.25*canvasWidth/500:d?canvasHeight>canvasWidth?a.scaleX=a.scaleY=.02*canvasWidth/5:a.scaleX=a.scaleY=.02*canvasHeight/5:a.scaleX=a.scaleY=.02*canvasWidth/10},M=function(){for(var a in o)s.removeChild(o[a]);o=[];var c=null;p=new createjs.Shape,p.graphics.setStrokeStyle(0).beginFill("rgba(37,37,37,1)"),p.alpha=.5;for(var d in n){var e=n[d];if(c){var f=new createjs.Shape;f.graphics.setStrokeStyle(3).beginStroke("black").moveTo(c.x,c.y).lineTo(e.x,e.y),f.z=50,o.push(f),s.addChild(f)}p.graphics.lineTo(e.x,e.y),c=e}o.push(p),s.addChild(p),p.graphics.lineTo(c.x,(1-b.bottomMargin)*canvasHeight).closePath(),s.sortChildren(function(a,b){return z1=a.z?a.z:5,z2=b.z?b.z:5,z1-z2})},N=function(){w.x=F/k*(1-2*b.sideMargin)*canvasWidth+b.sideMargin*canvasWidth,D||E?O():w.y=(1-b.bottomMargin)*canvasHeight,krpano.clientWidth>768?w.scaleX=w.scaleY=.04*canvasWidth/24:canvasHeight>canvasWidth?w.scaleX=w.scaleY=.04*canvasWidth/12:w.scaleX=w.scaleY=.04*canvasHeight/12};this.updateCurrentPosition=function(a){F=a,N()};var O=function(){for(var a in n){var b=n.length-1;if(w.x<n[a].x){b=a;break}}var c=n[b-1],d=n[b];w.y=(w.x-c.x)/(d.x-c.x)*(d.y-c.y)+c.y},P=function(a){D=!D,E=!0;var c=0;u.visible=!1;var d=n[n.length-1];D&&(d.graphics=d.mapUpGraphic,d.regX=d.regY=0,d.scaleX=d.scaleY=.02*canvasWidth/10);var e=t.scaleY*t.originalDimensions.height,f=setInterval(function(){if(10==c)E=!1,u.resize({x:1,y:1}),clearInterval(f),D?x.visible=!0:(d.graphics=d.mapDownGraphic,a?canvasHeight>canvasWidth?d.scaleX=d.scaleY=.25*canvasWidth/250:d.scaleX=d.scaleY=.25*canvasHeight/250:d.scaleX=d.scaleY=.25*canvasWidth/500,d.regX=414,d.regY=578,x.visible=!1),N(),a?u.visible=!1:u.visible=!0,s.update();else{c++;for(var g in n){var h=n[g],i=(h.elevation-(1-b.bottomMargin)*canvasHeight)/10;D?h.y+=i:h.y-=i}var j=(1-b.topMargin-3*b.bottomMargin)*canvasHeight/10;D?e+=j:e-=j,t.y=canvasHeight-e,t.scaleY=e/t.originalDimensions.height,M(),N(),a&&(u.visible=!1),s.update()}},30)}},copyToClipboard=function(a,b,c){var d=b.toString()+"	"+c.toString()+"	";window.prompt("horiz -- vertical\nImage # "+a.toString(),d)},copyCursorPos=function(a,b,c){var d=a.toString()+"	"+b.toString();window.prompt("horiz -- vertical\nImage # "+c.toString(),d)},captureW=function(a){var b=a.keyCode;87==b&&krpano.call("getOrientation();")};document.addEventListener("keydown",captureW,!1);