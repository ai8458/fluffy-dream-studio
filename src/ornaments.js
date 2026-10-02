import * as THREE from '../vendor/three/three.module.js?v=2.0.0';

const textureCache=new Map();
function canvasTexture(key,draw){
  if(textureCache.has(key))return textureCache.get(key);
  const canvas=document.createElement('canvas');canvas.width=128;canvas.height=128;draw(canvas.getContext('2d'));
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;textureCache.set(key,texture);return texture;
}
function pathStar(ctx,x,y,r,points=5){ctx.beginPath();for(let i=0;i<points*2;i++){const a=i*Math.PI/points-Math.PI/2,q=i%2?r*.44:r;ctx.lineTo(x+Math.cos(a)*q,y+Math.sin(a)*q);}ctx.closePath();}
function pathHeart(ctx,x,y,r){ctx.beginPath();ctx.moveTo(x,y+r*.8);ctx.bezierCurveTo(x-r*1.7,y-r*.3,x-r*.65,y-r*1.5,x,y-r*.55);ctx.bezierCurveTo(x+r*.65,y-r*1.5,x+r*1.7,y-r*.3,x,y+r*.8);ctx.closePath();}
export function heartShape(){const shape=new THREE.Shape();shape.moveTo(0,-.9);shape.bezierCurveTo(-1.8,.2,-.7,1.5,0,.55);shape.bezierCurveTo(.7,1.5,1.8,.2,0,-.9);return shape;}
export function heart(k,parent,color,pos,size){const geo=new THREE.ExtrudeGeometry(heartShape(),{depth:.20,bevelEnabled:true,bevelThickness:.1,bevelSize:.08,bevelSegments:3,steps:1});return k.mesh(parent,geo,k.mat(color),pos,[size,size,size]);}
export function dressMaterial(k,s){
  if(s.pattern==='none')return k.mat(s.dressColor);
  const texture=canvasTexture(`fabric-${s.pattern}-${s.dressColor}-${s.accentColor}`,ctx=>{
    ctx.fillStyle=s.dressColor;ctx.fillRect(0,0,128,128);ctx.fillStyle=s.accentColor;ctx.strokeStyle=s.accentColor;
    if(s.pattern==='stripes'){for(let x=0;x<128;x+=32)ctx.fillRect(x,0,9,128);}
    else if(s.pattern==='gingham'){ctx.globalAlpha=.55;for(let x=0;x<128;x+=32){ctx.fillRect(x,0,15,128);ctx.fillRect(0,x,128,15);}ctx.globalAlpha=1;}
    else for(let row=0;row<4;row++)for(let col=0;col<4;col++){
      const x=col*32+16+(row%2?8:0),y=row*32+16;
      if(s.pattern==='dots'){ctx.beginPath();ctx.arc(x,y,4,0,Math.PI*2);ctx.fill();}
      if(s.pattern==='stars'){pathStar(ctx,x,y,7);ctx.fill();}
      if(s.pattern==='hearts'){pathHeart(ctx,x,y,6);ctx.fill();}
      if(s.pattern==='flowers'){for(let i=0;i<5;i++){const a=i/5*Math.PI*2;ctx.beginPath();ctx.arc(x+Math.cos(a)*4,y+Math.sin(a)*4,3,0,Math.PI*2);ctx.fill();}ctx.fillStyle='#fff8df';ctx.beginPath();ctx.arc(x,y,2,0,Math.PI*2);ctx.fill();ctx.fillStyle=s.accentColor;}
    }
  });
  texture.wrapS=THREE.RepeatWrapping;texture.repeat.set(4,1);
  const material=new THREE.MeshStandardMaterial({map:texture,roughness:.76,side:THREE.DoubleSide});material.userData.temporary=true;return material;
}

export function decorateOutfit(k,parent,s,{hem,radius}){
  const {ball,tube,star,bow,flower,mesh,mat}=k,c=s.dressColor,a=s.accentColor,white='#fff6e9';
  const loop=(r,y,zScale=.8,color=a,width=.025)=>{const points=[];for(let i=0;i<=64;i++){const theta=i/64*Math.PI*2;points.push([Math.sin(theta)*r,y,Math.cos(theta)*r*zScale]);}tube(parent,points,width,color);};
  if(['raincoat','hoodie'].includes(s.outfit)){
    ball(parent,c,[0,1.91,-.12],[.43,.33,.28]);ball(parent,a,[0,1.98,.055],[.29,.21,.08]);
    if(s.outfit==='raincoat'){
      tube(parent,[[0,1.78,.238],[0,1.35,.33],[0,.85,.41]],.017,a);
      for(let j=0;j<4;j++)ball(parent,a,[.07,1.63-j*.19,.26+j*.048],[.026,.026,.015]);
      for(const side of [-1,1])ball(parent,a,[side*.23,1.1,.33],[.1,.073,.02]);
      const drop=ball(parent,a,[-.15,1.55,.242],[.045,.06,.012]);drop.rotation.z=-.1;
    }else{
      ball(parent,a,[0,1.18,.326],[.21,.13,.032]);
      for(const side of [-1,1]){tube(parent,[[side*.10,1.80,.2],[side*.12,1.64,.245]],.014,white);ball(parent,white,[side*.12,1.63,.25],[.023,.025,.02]);}
      heart(k,parent,'#e7a4bc',[0,1.43,.29],.055);
    }
  }
  if(s.outfit==='hanfu'){
    for(const side of [-1,1]){const lapel=ball(parent,white,[side*.1,1.65,.217],[.05,.22,.03]);lapel.rotation.z=side*.60;}
    loop(.326,1.47,.78,a,.049);bow(parent,a,0,1.43,.284,.65);
    for(const side of [-1,1]){const ribbon=ball(parent,a,[side*.08,1.04,.392],[.052,.34,.014]);ribbon.rotation.z=side*.12;flower(parent,side*.25,.8,.44,.28);}
  }
  if(s.outfit==='fairy'){
    for(let i=0;i<10;i++){const theta=i/10*Math.PI*2;const petal=ball(parent,i%2?c:a,[Math.sin(theta)*.46,1.05,Math.cos(theta)*.368],[.18,.32,.085]);petal.rotation.set(Math.cos(theta)*-.35,theta,Math.sin(theta)*.35);}
    flower(parent,0,1.57,.25,.40);loop(.33,1.43,.8,a,.025);
  }
  if(s.outfit==='astronaut'){
    ball(parent,c,[0,1.22,0],[.32,.24,.23]);loop(.3,1.43,.8,a,.032);
    for(const side of [-1,1]){ball(parent,c,[side*.185,.87,0],[.176,.43,.19]);ball(parent,a,[side*.18,.55,.02],[.18,.055,.20]);}
    ball(parent,a,[0,1.86,0],[.23,.08,.23]);ball(parent,a,[0,1.56,.228],[.18,.15,.025]);
    for(let i=0;i<3;i++)ball(parent,['#e8a4b9','#93bbc7','#ebd389'][i],[-.09+i*.09,1.51,.264],[.025,.025,.015]);
    star(parent,'#fff8e0',0,1.62,.27,.052);ball(parent,a,[0,1.48,-.26],[.27,.32,.13]);
  }
  if(s.outfit==='explorer'){
    ball(parent,c,[0,1.25,0],[.31,.18,.23]);
    for(const side of [-1,1]){ball(parent,c,[side*.18,1.03,0],[.195,.26,.225]);ball(parent,a,[side*.18,1.49,.21],[.08,.065,.025]);}
    loop(.30,1.35,.8,'#88675a',.034);ball(parent,a,[0,1.35,.26],[.045,.04,.013]);
    tube(parent,[[-.24,1.76,.2],[0,1.61,.245],[.24,1.76,.2]],.038,a);ball(parent,a,[0,1.35,-.25],[.25,.30,.14]);
  }
  if(s.outfit==='winter'){
    for(let i=0;i<26;i++){const theta=i/26*Math.PI*2;ball(parent,white,[Math.sin(theta)*radius,hem+.035,Math.cos(theta)*radius*.8],[.065,.05,.047]);}
    for(let i=0;i<3;i++)ball(parent,a,[0,1.60-i*.24,.24+i*.07],[.035,.035,.026]);
    for(const side of [-1,1]){const lapel=ball(parent,white,[side*.15,1.68,.20],[.09,.17,.055]);lapel.rotation.z=side*.4;}
  }
  if(s.outfit==='mermaid'){
    for(const side of [-1,1]){const fin=ball(parent,a,[side*.19,.35,.10],[.27,.09,.15]);fin.rotation.z=side*.4;}
    for(let row=0;row<4;row++)for(let col=0;col<9;col++){const theta=col/9*Math.PI*2+row*.3,y=.65+row*.17,t=(1.61-y)/1.25,r=.28+.075*Math.sin(Math.PI*t)-.16*t*t;const scale=ball(parent,a,[Math.sin(theta)*(r+.006),y,Math.cos(theta)*(r+.006)*.8],[.032,.028,.011]);scale.rotation.y=theta;}
    for(const side of [-1,1]){const shell=ball(parent,a,[side*.13,1.63,.197],[.13,.105,.041]);shell.rotation.z=side*.25;}star(parent,white,0,1.4,.26,.047);
  }
  if(s.outfit==='picnic'){
    ball(parent,white,[0,1.2,.325],[.28,.30,.055]);ball(parent,a,[0,1.22,.39],[.14,.095,.016]);flower(parent,0,1.25,.412,.33);
    for(const side of [-1,1])tube(parent,[[side*.18,1.80,.1],[side*.17,1.59,.23],[side*.2,1.42,.30]],.04,white);
    bow(parent,a,0,1.43,-.3,.7);
  }
  if(s.outfit==='magician'){
    mesh(parent,new THREE.CylinderGeometry(.30,.70,1.12,40,1,true,Math.PI/2,Math.PI),mat(a),[0,1.21,-.05],[1,1,.8]);
    bow(parent,a,0,1.78,.23,.40);for(const [x,y,z] of [[0,1.33,.33],[-.19,1.08,.4],[.25,.82,.42]])star(parent,a,x,y,z,.045);
  }
  if(s.outfit==='stardust'){
    loop(.335,1.44,.8,a,.035);star(parent,a,0,1.46,.285,.06);
    for(let row=0;row<3;row++){const r=.43+row*.13,y=1.20-row*.23;loop(r,y,.8,a,.012);for(let i=0;i<9;i++){const theta=i/9*Math.PI*2;star(parent,white,Math.sin(theta)*r,y,Math.cos(theta)*r*.8,.026);}}
  }
  if(s.outfit==='rainbow'){
    const colors=['#e2a3bb','#ecc18c','#efdc99','#aec9a7','#a4c5d7','#bda9d6'];
    for(let i=0;i<6;i++)loop(.34+i*.066,1.35-i*.12,.8,colors[i],.058);
    for(const side of [-1,1])ball(parent,white,[side*.12,1.62,.23],[.13,.08,.035]);star(parent,a,0,1.54,.27,.048);
  }
}

export function facePaint(k,parent,s,{w,cy},surface){
  if(s.paint==='none'||s.paintOpacity===0)return;
  const texture=canvasTexture(`paint-${s.paint}-${s.paintColor}`,ctx=>{
    const c=s.paintColor;ctx.fillStyle=c;ctx.strokeStyle=c;ctx.lineWidth=5;ctx.lineCap='round';
    if(s.paint==='freckles'){for(const [x,y,r] of [[29,59,4],[48,45,3],[64,65,3],[85,46,4],[96,75,3],[43,81,3]]){ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();}}
    if(s.paint==='stars'){for(const [x,y,r] of [[46,50,24],[91,76,14],[25,92,9]]){pathStar(ctx,x,y,r);ctx.fill();}}
    if(s.paint==='hearts'){pathHeart(ctx,48,55,24);ctx.fill();pathHeart(ctx,90,84,13);ctx.fill();}
    if(s.paint==='whiskers'){for(let i=0;i<3;i++){ctx.beginPath();ctx.moveTo(24,43+i*22);ctx.lineTo(106,36+i*28);ctx.stroke();}}
    if(s.paint==='butterfly'){for(const side of [-1,1]){ctx.save();ctx.translate(64,66);ctx.rotate(side*.4);ctx.beginPath();ctx.ellipse(side*24,-13,24,32,0,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.ellipse(side*20,21,20,18,0,0,Math.PI*2);ctx.fill();ctx.restore();}ctx.strokeStyle='#fff6e4';ctx.beginPath();ctx.moveTo(64,34);ctx.lineTo(64,97);ctx.stroke();}
    if(s.paint==='rainbow'){['#d4839e','#e7b277','#dacc86','#9fbaa0','#91abc8'].forEach((color,i)=>{ctx.strokeStyle=color;ctx.lineWidth=7;ctx.beginPath();ctx.arc(64,85,44-i*8,Math.PI,Math.PI*2);ctx.stroke();});}
    if(s.paint==='blossom'){for(let i=0;i<5;i++){const a=i/5*Math.PI*2;ctx.beginPath();ctx.ellipse(64+Math.cos(a)*22,64+Math.sin(a)*22,19,14,a,0,Math.PI*2);ctx.fill();}ctx.fillStyle='#fff0c5';ctx.beginPath();ctx.arc(64,64,9,0,Math.PI*2);ctx.fill();}
    if(s.paint==='snow'){for(let i=0;i<6;i++){ctx.save();ctx.translate(64,64);ctx.rotate(i*Math.PI/3);ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(0,-42);ctx.moveTo(-12,-23);ctx.lineTo(0,-32);ctx.lineTo(12,-23);ctx.stroke();ctx.restore();}}
  });
  for(const side of [-1,1]){
    const material=new THREE.MeshBasicMaterial({map:texture,transparent:true,opacity:s.paintOpacity/100,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2});material.userData.temporary=true;
    const geometry=new THREE.PlaneGeometry(.30,.27,12,10),points=geometry.attributes.position;
    for(let i=0;i<points.count;i++){const x=points.getX(i)+side*w*.58,y=points.getY(i)+cy-.19;points.setXYZ(i,x,y,surface(x,y)+.014);}
    geometry.computeVertexNormals();const decal=k.mesh(parent,geometry,material);decal.castShadow=false;decal.receiveShadow=false;
  }
}

export function extraAccessories(k,parent,head,s,{w,cy},handAnchor){
  const {ball,tube,mesh,mat,star,flower,bow}=k,c=s.accentColor;
  if(s.accessory==='cat')for(const side of [-1,1]){
    const ear=mesh(head,new THREE.ConeGeometry(.23,.42,3),mat(s.hairColor),[side*.57,cy+.81,.03]);ear.rotation.y=Math.PI/2;ear.rotation.z=-side*.27;
    const inner=mesh(head,new THREE.ConeGeometry(.125,.28,3),mat('#e4b5c0'),[side*.57,cy+.8,.14]);inner.rotation.copy(ear.rotation);
  }
  if(s.accessory==='beret'){
    const hat=ball(head,c,[-.12,cy+.80,0],[.71,.21,.59]);hat.rotation.z=.15;ball(head,c,[-.22,cy+1.0,.01],[.055,.09,.055]);star(head,'#fff0c5',-.52,cy+.85,.38,.07);
  }
  if(s.accessory==='sunhat'){
    ball(head,'#e4c895',[0,cy+.76,-.045],[.95,.10,.81]);ball(head,'#e4c895',[0,cy+.86,-.08],[.61,.28,.56]);
    const band=mesh(head,new THREE.TorusGeometry(.59,.043,10,64),mat(c),[0,cy+.82,-.045],[1,1,.91]);band.rotation.x=Math.PI/2;bow(head,c,.57,cy+.78,.45,.65);
  }
  if(s.accessory==='headphones'){
    const arc=[];for(let i=0;i<=32;i++){const a=i/32*Math.PI;arc.push([Math.cos(a)*(w+.09),cy+.07+Math.sin(a)*.92,-.04]);}tube(head,arc,.065,c);
    for(const side of [-1,1]){ball(head,c,[side*(w+.1),cy+.03,.02],[.13,.22,.22]);star(head,'#fff0cf',side*(w+.1),cy+.03,.232,.06);}
  }
  if(s.accessory==='starclip'){star(head,c,w-.14,cy+.44,.57,.12);star(head,'#fff0cf',w-.3,cy+.60,.52,.062);}
  if(s.accessory==='unicorn'){
    const horn=mesh(head,new THREE.ConeGeometry(.17,.53,32),mat('#e4cb91',.3,.2),[0,cy+1.06,.13]);horn.rotation.x=.15;
    for(const side of [-1,1])flower(head,side*.27,cy+.80,.38,.7);
  }
  if(s.eyewear!=='none'){
    const spacing=.245+(s.eyeSpace-50)*.0014;
    for(const side of [-1,1]){
      const x=side*spacing,y=cy+.015,z=.822,points=[];
      if(s.eyewear==='heart'){for(const p of heartShape().getPoints(40))points.push([x+p.x*.145,y+p.y*.16,z]);points.push(points[0]);}
      else for(let i=0;i<=60;i++){const theta=i/60*Math.PI*2,r=s.eyewear==='star'?(i%12<6?.215:.165):s.eyewear==='flower'?.195+Math.cos(theta*6)*.025:.19;points.push([x+Math.cos(theta)*r,y+Math.sin(theta)*r,z]);}
      tube(head,points,.017,c);
    }
    tube(head,[[-spacing+.18,cy+.035,.822],[0,cy+.07,.825],[spacing-.18,cy+.035,.822]],.014,c);
    for(const side of [-1,1])tube(head,[[side*(spacing+.19),cy+.02,.822],[side*w,cy+.04,.35],[side*w,cy+.02,.04]],.014,c);
  }
  if(s.earrings!=='none')for(const side of [-1,1]){
    const x=side*(w+.015),y=cy-.23,z=.10;ball(head,'#e3c487',[x,y,z],[.029,.03,.026]);
    if(s.earrings==='pearl')ball(head,'#fff4e3',[x,y-.08,z],[.05,.062,.048],.22);
    if(s.earrings==='star')star(head,c,x,y-.09,z,.065);
    if(s.earrings==='flower')flower(head,x,y-.095,z,.37);
    if(s.earrings==='cherry'){tube(head,[[x,y,z],[x-.04,y-.06,z],[x-.04,y-.10,z]],.01,'#91a585');tube(head,[[x,y,z],[x+.04,y-.07,z]],.01,'#91a585');for(const d of [-1,1])ball(head,'#c87f98',[x+d*.04,y-.12,z],[.045,.045,.04]);}
  }
  if(s.necklace==='bow')bow(parent,c,0,1.8,.242,.53);
  if(s.necklace==='scarf'){
    ball(parent,c,[0,1.86,.005],[.24,.085,.21]);const tail=ball(parent,c,[.13,1.62,.265],[.073,.24,.028]);tail.rotation.z=.12;
  }
  if(s.necklace==='pearl')for(let i=0;i<13;i++){const a=i/12*Math.PI;ball(parent,'#fff5e5',[Math.cos(a)*.23,1.78-Math.sin(a)*.14,.17+Math.sin(a)*.095],[.026,.027,.023],.3);}
  if(s.necklace==='bell'){tube(parent,[[-.16,1.86,.1],[0,1.73,.245],[.16,1.86,.1]],.017,c);ball(parent,'#e0bb74',[0,1.72,.26],[.065,.065,.054],.3);ball(parent,'#9d7a61',[0,1.69,.308],[.022,.014,.007]);}
  if(s.wings!=='none')for(const side of [-1,1]){
    const wing=new THREE.Group();wing.position.set(side*.23,1.64,-.25);wing.rotation.z=-side*.38;parent.add(wing);
    if(s.wings==='angel')for(let i=0;i<5;i++){const feather=ball(wing,'#fff6e9',[side*(.18+i*.12),.14-i*.085,0],[.14,.36-i*.036,.07]);feather.rotation.z=-side*(.45+i*.15);}
    else if(s.wings==='leaf'){const leaf=ball(wing,c,[side*.35,.12,0],[.29,.59,.075]);leaf.rotation.z=-side*.5;tube(wing,[[0,-.20,.08],[side*.28,.13,.08],[side*.58,.48,.06]],.014,'#fff1cb');}
    else{const upper=ball(wing,c,[side*.36,.25,0],[.36,.47,.07]);upper.rotation.z=-side*.35;const lower=ball(wing,s.dressColor,[side*.31,-.18,.01],[.30,.29,.068]);lower.rotation.z=side*.35;for(let i=0;i<4;i++)ball(wing,'#fff2d7',[side*(.24+i*.11),.4-i*.06,.072],[.035,.047,.012]);}
  }
  if(s.handheld!=='none'){
    const prop=new THREE.Group();handAnchor.add(prop);prop.position.set(-.025,-.60,.25);prop.rotation.z=-handAnchor.rotation.z;
    if(s.handheld==='wand'){tube(prop,[[0,-.08,0],[0,.55,0]],.025,c);star(prop,'#f3d38a',0,.65,0,.14);bow(prop,s.dressColor,0,.40,.035,.35);}
    if(s.handheld==='balloon'){tube(prop,[[0,0,0],[-.25,.6,0],[-.52,1.2,-.02]],.008,'#c59caa');heart(k,prop,s.dressColor,[-.52,1.51,-.02],.30);ball(prop,c,[-.52,1.23,-.02],[.04,.04,.03]);}
    if(s.handheld==='teddy'){
      ball(prop,'#c99f76',[0,-.03,.08],[.20,.25,.13]);ball(prop,'#c99f76',[0,.22,.10],[.23,.20,.15]);
      for(const side of [-1,1]){ball(prop,'#c99f76',[side*.17,.38,.08],[.085,.085,.065]);ball(prop,'#c99f76',[side*.19,-.01,.09],[.08,.14,.07]);ball(prop,'#c99f76',[side*.1,-.23,.09],[.08,.11,.08]);ball(prop,'#5f4b42',[side*.065,.24,.25],[.017,.019,.008]);}ball(prop,'#f5dcc1',[0,.17,.23],[.09,.066,.04]);ball(prop,'#725345',[0,.185,.267],[.025,.021,.01]);bow(prop,c,0,.03,.23,.32);
    }
    if(s.handheld==='bouquet'){for(let i=0;i<5;i++){const a=i/5*Math.PI*2,x=Math.cos(a)*.16,y=.29+Math.sin(a)*.13;tube(prop,[[0,-.12,0],[x,y,0]],.014,'#8caa81');flower(prop,x,y,.04,.58);}bow(prop,c,0,.07,.04,.40);}
    if(s.handheld==='umbrella'){
      tube(prop,[[0,-.1,0],[-.55,1.05,0]],.024,'#d9bc8e');const colors=[s.dressColor,c,'#fff0d4'];
      for(let i=0;i<8;i++){const canopy=new THREE.SphereGeometry(.58,10,14,i/8*Math.PI*2,Math.PI/4,0,Math.PI*.38);mesh(prop,canopy,mat(colors[i%3]),[-.55,1.04,0],[1,.48,1]);}ball(prop,c,[-.55,1.35,0],[.04,.06,.04]);
    }
    if(s.handheld==='book'){
      const book=mesh(prop,new THREE.BoxGeometry(.31,.41,.08),mat(c),[0,.08,.07]);book.rotation.z=-.12;mesh(book,new THREE.BoxGeometry(.27,.36,.016),mat('#fff4df'),[0,0,.046]);star(prop,s.dressColor,0,.11,.14,.075);
    }
  }
}

export function createAtmosphere(k,parent,s){
  const objects=[];if(s.effect==='none')return objects;
  for(let i=0;i<14;i++){
    const a=i/14*Math.PI*2,x=Math.cos(a)*(1.15+(i%3)*.17),y=.75+(i%5)*.57,z=Math.sin(a)*.65-.12;
    let object;
    if(s.effect==='sparkles')object=k.star(parent,i%2?s.accentColor:'#f4da9e',x,y,z,.025+(i%3)*.012);
    if(s.effect==='petals'){object=k.ball(parent,i%2?'#e7b1c6':'#fff0db',[x,y,z],[.042,.071,.018]);object.rotation.z=a;}
    if(s.effect==='bubbles'){const material=new THREE.MeshPhysicalMaterial({color:'#fff6fe',transparent:true,opacity:.28,roughness:.08,metalness:.15,depthWrite:false});material.userData.temporary=true;object=k.mesh(parent,new THREE.SphereGeometry(.06+(i%3)*.025,16,12),material,[x,y,z]);}
    object.castShadow=false;object.receiveShadow=false;object.userData.seed=i;object.userData.baseY=y;objects.push(object);
  }
  return objects;
}
export function drawPhotoFrame(ctx,size,height,s){
  if(s.frame==='classic')return;
  ctx.save();ctx.strokeStyle=s.accentColor;ctx.fillStyle=s.accentColor;ctx.lineWidth=size*.004;
  if(s.frame==='polaroid'){ctx.strokeStyle='#fffdf8';ctx.lineWidth=size*.045;ctx.strokeRect(size*.025,size*.025,size*.95,height-size*.05);ctx.fillStyle='#dfb8c580';ctx.save();ctx.translate(size*.12,size*.06);ctx.rotate(-.3);ctx.fillRect(-size*.06,-size*.015,size*.12,size*.03);ctx.restore();}
  else{
    ctx.strokeRect(size*.035,size*.035,size*.93,height-size*.07);
    for(let i=0;i<9;i++)for(const side of [-1,1]){const x=side===-1?size*.035:size*.965,y=size*(.10+i*.115),r=size*.012;
      if(s.frame==='stars'){pathStar(ctx,x,y,r);ctx.fill();}
      if(s.frame==='candy'){pathHeart(ctx,x,y,r);ctx.fill();}
      if(s.frame==='garden'){for(let j=0;j<5;j++){const a=j*Math.PI*2/5;ctx.beginPath();ctx.arc(x+Math.cos(a)*r*.7,y+Math.sin(a)*r*.7,r*.55,0,Math.PI*2);ctx.fill();}ctx.fillStyle='#fff1ca';ctx.beginPath();ctx.arc(x,y,r*.38,0,Math.PI*2);ctx.fill();ctx.fillStyle=s.accentColor;}
    }
  }
  ctx.restore();
}
