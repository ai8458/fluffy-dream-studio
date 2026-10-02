import * as THREE from '../vendor/three/three.module.js?v=2.0.0';
import { dressMaterial,decorateOutfit,facePaint,extraAccessories,createAtmosphere,drawPhotoFrame,heart } from './ornaments.js?v=2.0.0';

const V=(x,y,z)=>new THREE.Vector3(x,y,z);
const sphereGeo=new THREE.SphereGeometry(1,40,28);
const materialCache=new Map();
const mat=(color,roughness=.63,metalness=0)=>{
  const key=`${color}-${roughness}-${metalness}`;
  if(!materialCache.has(key))materialCache.set(key,new THREE.MeshStandardMaterial({color,roughness,metalness}));
  return materialCache.get(key);
};
function mesh(parent,geometry,material,position=[0,0,0],scale=[1,1,1]){
  const item=new THREE.Mesh(geometry,material);item.position.set(...position);item.scale.set(...scale);item.castShadow=true;item.receiveShadow=true;parent.add(item);return item;
}
const ball=(parent,color,pos,size,roughness=.63)=>mesh(parent,sphereGeo,mat(color,roughness),pos,size);
function tube(parent,points,radius,color){
  const curve=new THREE.CatmullRomCurve3(points.map(p=>V(...p)));
  const geometry=new THREE.TubeGeometry(curve,24,radius,8,false);
  return mesh(parent,geometry,mat(color));
}
function disposeGroup(group){group.traverse(object=>{if(object.isMesh && object.geometry!==sphereGeo)object.geometry.dispose();if(object.material?.userData.temporary)object.material.dispose();});group.removeFromParent();}
function gradientTexture(kind){
  const canvas=document.createElement('canvas');canvas.width=128;canvas.height=128;const c=canvas.getContext('2d');
  const gradient=c.createRadialGradient(64,64,0,64,64,64);
  if(kind==='blush'){gradient.addColorStop(0,'rgba(214,99,115,.6)');gradient.addColorStop(.4,'rgba(229,137,145,.34)');gradient.addColorStop(1,'rgba(239,165,161,0)');}
  else{gradient.addColorStop(0,'rgba(127,86,85,.23)');gradient.addColorStop(.35,'rgba(127,86,85,.17)');gradient.addColorStop(1,'rgba(127,86,85,0)');}
  c.fillStyle=gradient;c.fillRect(0,0,128,128);const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;return texture;
}
function starShape(){const shape=new THREE.Shape();for(let i=0;i<10;i++){const angle=i*Math.PI/5+Math.PI/2,r=i%2?.45:1;const x=Math.cos(angle)*r,y=Math.sin(angle)*r;if(!i)shape.moveTo(x,y);else shape.lineTo(x,y);}shape.closePath();return shape;}
function star(parent,color,x,y,z,size){const geo=new THREE.ExtrudeGeometry(starShape(),{depth:.16,bevelEnabled:true,bevelThickness:.06,bevelSize:.045,bevelSegments:3,steps:1});return mesh(parent,geo,mat(color),[x,y,z],[size,size,size]);}
function bow(parent,color,x,y,z,size=1){const group=new THREE.Group();group.position.set(x,y,z);group.scale.setScalar(size);parent.add(group);const a=ball(group,color,[-.13,0,0],[.19,.13,.075]);a.rotation.z=-.35;const b=ball(group,color,[.13,0,0],[.19,.13,.075]);b.rotation.z=.35;ball(group,color,[0,-.005,.06],[.065,.075,.058]);const tail1=ball(group,color,[-.06,-.14,-.01],[.057,.15,.03]);tail1.rotation.z=-.35;const tail2=ball(group,color,[.06,-.14,-.01],[.057,.15,.03]);tail2.rotation.z=.35;return group;}
function flower(parent,x,y,z,size=1){const group=new THREE.Group();group.position.set(x,y,z);group.scale.setScalar(size);parent.add(group);for(let i=0;i<7;i++){const a=i/7*Math.PI*2;const petal=ball(group,'#fff7df',[Math.cos(a)*.12,Math.sin(a)*.12,0],[.105,.065,.043]);petal.rotation.z=a;}ball(group,'#e9c375',[0,0,.04],[.085,.085,.055]);return group;}

const KIT={ball,tube,mesh,mat,star,bow,flower};
export const BACKGROUNDS={peach:{top:'#fff8ef',bottom:'#f2e1dc',platform:'#ecd2ce'},lavender:{top:'#f8f4ff',bottom:'#e5dcf0',platform:'#d5c4e6'},mint:{top:'#f7faef',bottom:'#dde9de',platform:'#c8dbc7'},sky:{top:'#f4faff',bottom:'#dce8ef',platform:'#c7d9e7'},sunset:{top:'#fff3dc',bottom:'#edc7b6',platform:'#e4b69f'},forest:{top:'#eef5e7',bottom:'#bcd1ba',platform:'#abc1a4'},candy:{top:'#fff2f8',bottom:'#efcbdc',platform:'#e3b5cf'},aurora:{top:'#edf7fb',bottom:'#b9bdde',platform:'#a5accc'}};

export class AvatarScene {
  constructor(canvas){
    this.canvas=canvas;this.disposed=false;this.angle=0;this.targetAngle=0;this.view='full';this.zoom=1;this.bounce=0;this.reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,preserveDrawingBuffer:true,powerPreference:'high-performance'});
    this.renderer.setPixelRatio(Math.min(devicePixelRatio,2));this.renderer.shadowMap.enabled=true;this.renderer.shadowMap.type=THREE.PCFSoftShadowMap;this.renderer.shadowMap.autoUpdate=false;this.renderer.outputColorSpace=THREE.SRGBColorSpace;this.renderer.toneMapping=THREE.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.15;
    this.scene=new THREE.Scene();this.camera=new THREE.PerspectiveCamera(32,1,.1,80);this.camera.position.set(0,2.55,9);this.camera.lookAt(0,1.55,0);
    this.scene.add(new THREE.HemisphereLight('#fff8f1','#c4a4b3',2.2));
    const key=new THREE.DirectionalLight('#fff4e5',4);key.position.set(-3,6,5);key.castShadow=true;key.shadow.mapSize.set(2048,2048);Object.assign(key.shadow.camera,{left:-3,right:3,top:5,bottom:-2,near:.1,far:15});key.shadow.normalBias=.025;key.shadow.bias=-.0002;key.shadow.radius=4;this.scene.add(key);
    const fill=new THREE.DirectionalLight('#e5eaff',1.3);fill.position.set(4,3,3);this.scene.add(fill);const rim=new THREE.DirectionalLight('#fff1df',2.5);rim.position.set(1,5,-4);this.scene.add(rim);
    this.pedestal=new THREE.Group();this.scene.add(this.pedestal);
    this.platformMaterial=new THREE.MeshStandardMaterial({color:'#ecd2ce',roughness:.73});
    mesh(this.pedestal,new THREE.CylinderGeometry(1.05,1.08,.13,96),this.platformMaterial,[0,.005,0]);
    mesh(this.pedestal,new THREE.CylinderGeometry(1.02,1.05,.06,96),mat('#fff7ed'),[0,.1,0]);
    const ring=mesh(this.pedestal,new THREE.TorusGeometry(1.035,.019,12,96),mat('#fff8f1'),[0,.07,0]);ring.rotation.x=Math.PI/2;
    this.shadowTexture=gradientTexture('shadow');const shadow=mesh(this.pedestal,new THREE.PlaneGeometry(3.5,3.5),new THREE.MeshBasicMaterial({map:this.shadowTexture,transparent:true,depthWrite:false}),[0,-.08,0]);shadow.rotation.x=-Math.PI/2;shadow.castShadow=false;shadow.receiveShadow=false;
    this.blushTexture=gradientTexture('blush');this.blushMaterial=new THREE.MeshBasicMaterial({map:this.blushTexture,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1});
    this.avatar=new THREE.Group();this.scene.add(this.avatar);
    this.atmosphere=new THREE.Group();this.scene.add(this.atmosphere);this.particles=[];
    this.resizeObserver=new ResizeObserver(()=>this.resize());this.resizeObserver.observe(canvas.parentElement);this.resize();this.bindDrag();this.start=performance.now();this.animate();
  }
  resize(){const rect=this.canvas.parentElement.getBoundingClientRect();if(!rect.width||!rect.height)return;this.renderer.setSize(rect.width,rect.height,false);this.camera.aspect=rect.width/rect.height;this.camera.updateProjectionMatrix();this.renderer.render(this.scene,this.camera);}
  bindDrag(){
    let active=false,lastX=0,moved=false,startX=0;
    this.canvas.addEventListener('pointerdown',event=>{if(event.button!==0)return;active=true;lastX=startX=event.clientX;moved=false;this.canvas.setPointerCapture(event.pointerId);});
    this.canvas.addEventListener('pointermove',event=>{if(!active)return;const dx=event.clientX-lastX;if(Math.abs(event.clientX-startX)>5)moved=true;this.targetAngle+=dx*.012;lastX=event.clientX;});
    const stop=()=>{if(active&&!moved)this.bounce=1;active=false;};this.canvas.addEventListener('pointerup',stop);this.canvas.addEventListener('pointercancel',()=>{active=false;});
    this.canvas.addEventListener('keydown',event=>{if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();this.targetAngle+=event.key==='ArrowLeft'?-.25:.25;}if(event.key==='Home')this.resetCamera();});
  }
  update(state){
    this.state=state;disposeGroup(this.avatar);this.avatar=new THREE.Group();this.scene.add(this.avatar);this.avatar.rotation.y=this.angle;
    this.buildBody(state);this.buildHead(state);this.buildAccessories(state);
    extraAccessories(KIT,this.avatar,this.head,state,this.faceInfo,this.leftArm);
    facePaint(KIT,this.head,state,this.faceInfo,this.surface);
    disposeGroup(this.atmosphere);this.atmosphere=new THREE.Group();this.scene.add(this.atmosphere);this.particles=createAtmosphere(KIT,this.atmosphere,state);
    this.renderer.shadowMap.needsUpdate=true;
    const bg=BACKGROUNDS[state.background];this.platformMaterial.color.set(bg.platform);this.canvas.parentElement.style.background=`radial-gradient(ellipse at 52% 42%, ${bg.top} 0%, ${bg.top} 30%, ${bg.bottom} 100%)`;
  }
  buildBody(s){
    const parent=this.avatar,color=s.dressColor,white='#fff4e7';
    const fabric=dressMaterial(KIT,s);
    for(const side of [-1,1]){
      if(s.outfit!=='mermaid'){
      ball(parent,white,[side*.19,.61,.015],[.115,.37,.12]);
      ball(parent,color,[side*.2,.265,.11],[.16,.115,.23],.48);
      ball(parent,'#fff8ef',[side*.2,.20,.12],[.161,.045,.228]);
      const strap=ball(parent,color,[side*.2,.33,.12],[.155,.042,.068]);strap.rotation.x=-.2;
      ball(parent,'#f9e9da',[side*.2,.347,.17],[.045,.018,.04]);
      if(s.shoes==='boots'){ball(parent,color,[side*.2,.45,.025],[.16,.22,.16]);ball(parent,s.accentColor,[side*.2,.61,.02],[.17,.044,.17]);}
      if(s.shoes==='sneakers')for(let j=0;j<3;j++)tube(parent,[[side*.2-.065,.355-j*.011,.1+j*.045],[side*.2+.065,.355-j*.011,.1+j*.045]],.009,white);
      if(s.shoes==='ballet'){tube(parent,[[side*.2-.075,.32,.12],[side*.2+.07,.50,.11]],.013,s.accentColor);tube(parent,[[side*.2+.075,.32,.12],[side*.2-.07,.50,.11]],.013,s.accentColor);bow(parent,s.accentColor,side*.2,.32,.27,.22);}
      if(s.shoes==='bunny'){for(const d of [-1,1])ball(parent,white,[side*.2+d*.047,.39,.20],[.035,.09,.028]);for(const d of [-1,1])ball(parent,'#7e625c',[side*.2+d*.044,.29,.327],[.013,.015,.009]);}
      }
      const armGroup=new THREE.Group();armGroup.position.set(side*.35,1.7,0);parent.add(armGroup);
      armGroup.rotation.z=s.pose==='wave'&&side===1?2.25:s.pose==='dance'?side*1.15:s.pose==='shy'?-side*.42:side*.22;
      if(s.pose==='shy')armGroup.rotation.x=-.55;
      const sleeveColor=['astronaut','winter','hoodie','raincoat','hanfu','magician','cozy'].includes(s.outfit)?color:s.skin;
      ball(armGroup,sleeveColor,[0,-.29,.018],[s.outfit==='hanfu'?.19:.113,.32,.12]);
      ball(armGroup,s.skin,[0,-.59,.05],[.122,.14,.117]);ball(armGroup,s.skin,[-side*.06,-.61,.11],[.06,.08,.06]);
      ball(armGroup,color,[0,0,0],[.19,.18,.205]);
      if(side===-1)this.leftArm=armGroup;else this.rightArm=armGroup;
    }
    ball(parent,s.skin,[0,1.9,0],[.17,.26,.15]);
    mesh(parent,sphereGeo,fabric,[0,1.60,0],[.315,.30,.225]);
    const hem={cozy:1.05,hoodie:1,hanfu:.56,winter:.70,mermaid:.36,magician:.58,stardust:.52,rainbow:.66,raincoat:.80}[s.outfit]??.9;
    const skirtRadius={princess:.64,ballet:.64,cozy:.39,hoodie:.40,hanfu:.61,fairy:.56,mermaid:.12,magician:.62,stardust:.72,rainbow:.69}[s.outfit]??.53;
    const pants=['astronaut','explorer'].includes(s.outfit);
    const positions=[],uv=[],indices=[];const steps=64,rows=20;
    for(let j=0;j<=rows;j++){
      const t=j/rows,y=1.61-(1.61-hem)*t,r=s.outfit==='mermaid'?.28+.075*Math.sin(Math.PI*t)-.16*t*t:.28+(skirtRadius-.28)*Math.pow(t,1.2);
      for(let i=0;i<=steps;i++){const a=i/steps*Math.PI*2,fold=1+Math.cos(a*12)*.025*t;positions.push(Math.sin(a)*r*fold,y+Math.sin(a*12)*.012*t*t,Math.cos(a)*r*.8*fold);uv.push(i/steps,t);if(j<rows&&i<steps){const n=j*(steps+1)+i;indices.push(n,n+1,n+steps+1,n+1,n+steps+2,n+steps+1);}}
    }
    const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geometry.setIndex(indices);geometry.computeVertexNormals();
    fabric.side=THREE.DoubleSide;if(!pants)mesh(parent,geometry,fabric);else geometry.dispose();
    const hemLine=[];for(let i=0;i<=96;i++){const a=i/96*Math.PI*2;hemLine.push([Math.sin(a)*skirtRadius,hem+.022,Math.cos(a)*skirtRadius*.8]);}if(!pants)tube(parent,hemLine,.025,white);
    for(const side of [-1,1]){
      const collar=ball(parent,white,[side*.105,1.80,.194],[.118,.087,.026]);collar.rotation.z=side*.32;
    }
    if(s.outfit==='strawberry'){
      // A raised strawberry appliqué with little cream seeds.
      ball(parent,'#c55c7b',[-.055,1.29,.338],[.09,.115,.031]);ball(parent,'#c55c7b',[.055,1.29,.338],[.09,.115,.031]);ball(parent,'#c55c7b',[0,1.225,.35],[.072,.09,.028]);
      for(const a of [-.7,0,.7]){const leaf=ball(parent,'#91a17b',[Math.sin(a)*.058,1.40,.33],[.025,.062,.015]);leaf.rotation.z=a;}
      for(const [x,y] of [[-.055,1.31],[.05,1.29],[0,1.25],[-.02,1.35],[.017,1.20]])ball(parent,'#fbe4b6',[x,y,.378],[.009,.015,.005]);
      for(let i=0;i<16;i++){const a=(i/16)*Math.PI*2;ball(parent,white,[Math.sin(a)*.48,1.01,Math.cos(a)*.384],[.032,.039,.018]);}
    }else if(s.outfit==='sailor'){
      tube(parent,[[-.23,1.81,.16],[-.16,1.71,.21],[0,1.54,.235],[.16,1.71,.21],[.23,1.81,.16]],.045,'#fff7ef');
      bow(parent,'#718dab',0,1.53,.255,.43);
      tube(parent,hemLine.map(([x,y,z])=>[x*.93,y+.11,z*.93]),.016,white);
    }else if(s.outfit==='overalls'){
      for(const side of [-1,1]){tube(parent,[[side*.16,1.81,.12],[side*.17,1.59,.238],[side*.18,1.4,.283]],.035,'#e7d79e');ball(parent,'#e8c078',[side*.17,1.49,.276],[.025,.025,.012]);}
      ball(parent,'#ccd5ad',[0,1.26,.335],[.16,.12,.017]);flower(parent,0,1.30,.36,.33);
    }else if(s.outfit==='princess'){
      star(parent,'#f4dca0',0,1.47,.265,.07);
      for(let i=0;i<10;i++){const a=i/10*Math.PI*2;star(parent,'#f7e7c2',Math.sin(a)*.55,1.08,Math.cos(a)*.455,.028);}
      bow(parent,white,0,1.56,.25,.48);
      for(const side of [-1,1]){const drape=ball(parent,white,[side*.32,1.39,.20],[.23,.10,.035]);drape.rotation.z=side*-.5;}
    }else if(s.outfit==='cozy'){
      for(let i=-3;i<=3;i++)tube(parent,[[i*.079,1.6,.238],[i*.09,1.35,.283],[i*.10,1.09,.305]],.008,color);
      flower(parent,-.12,1.57,.245,.33);
      ball(parent,white,[0,1.82,.015],[.195,.08,.187]);
      ball(parent,'#b6a0bf',[0,.91,0],[.37,.16,.27]);
    }else if(s.outfit==='ballet'){
      bow(parent,'#fff0ed',0,1.55,.254,.65);
      for(let layer=0;layer<3;layer++){const points=[];for(let i=0;i<=72;i++){const a=i/72*Math.PI*2;points.push([Math.sin(a)*(.49+layer*.07),1.12-layer*.1+Math.cos(a*12)*.018,Math.cos(a)*(.49+layer*.07)*.8]);}tube(parent,points,.027,'#f9e7e8');}
    }
    decorateOutfit(KIT,parent,s,{hem,radius:skirtRadius});
  }
  buildHead(s){
    const faceGroup=new THREE.Group();this.avatar.add(faceGroup);this.head=faceGroup;
    const widths={round:.77,oval:.69,heart:.75,cheeky:.81,petal:.72,bean:.70,peach:.76,bubble:.83,elf:.66};
    const heights={round:.79,oval:.86,heart:.80,cheeky:.75,petal:.83,bean:.74,peach:.81,bubble:.72,elf:.84};
    const w=widths[s.face]+(s.faceWidth-50)*.0015,h=heights[s.face],cy=2.68;
    this.faceInfo={w,h,cy};
    const geo=new THREE.SphereGeometry(1,64,48);const attr=geo.attributes.position;
    for(let i=0;i<attr.count;i++){
      let x=attr.getX(i),y=attr.getY(i),z=attr.getZ(i);const lower=Math.max(0,-y);const taper=(s.face==='heart'?.22:s.face==='petal'?.12:.04)+(s.chin-50)*.001;
      const cheek=1+Math.exp(-Math.pow((y+.22)*4,2))*(s.cheek-50)*.001;
      x*=w*(1-lower*taper)*cheek;y*=h;z*=.65;attr.setXYZ(i,x,y,z);
    }
    geo.computeVertexNormals();mesh(faceGroup,geo,mat(s.skin),[0,cy,.08]);
    const surface=(x,y)=>.08+.65*Math.sqrt(Math.max(.1,1-(x/w)**2-((y-cy)/h)**2));
    this.surface=surface;
    for(const side of [-1,1]){
      ball(faceGroup,s.skin,[side*w*.97,cy-.04,.04],[.13,.175,.11]);ball(faceGroup,'#dea595',[side*w*1.037,cy-.055,.124],[.053,.093,.025]);
      if(s.face==='elf'){const ear=ball(faceGroup,s.skin,[side*(w+.05),cy+.02,.02],[.23,.085,.065]);ear.rotation.z=side*.38;}
    }
    const eyes=new THREE.Group();faceGroup.add(eyes);this.eyeGroup=eyes;
    const space=.245+(s.eyeSpace-50)*.0014,eyeScale=.86+s.eyeSize*.003;
    for(const side of [-1,1]){
      const x=space*side,y=cy+.01,z=surface(x,y)+.019;
      if(s.eyes==='gentle'||(s.eyes==='wink'&&side===1))tube(eyes,[[x-.11,y-.025,z],[x-.055,y+.037,z+.012],[x,y+.05,z+.018],[x+.055,y+.037,z+.012],[x+.11,y-.025,z]],.021,'#65443d');
      else if(s.eyes==='heart'){heart(KIT,eyes,s.eyeColor,[x,y,z],.11*eyeScale);ball(eyes,'#fff9ed',[x-.027,y+.045,z+.06],[.024,.025,.009]);}
      else {
        const ry=s.eyes==='sleepy'?.087:s.eyes==='round'?.13:.148;const rx=s.eyes==='round'?.111:.099;
        ball(eyes,'#513734',[x,y,z],[rx*eyeScale,ry*eyeScale,.043],.19);
        ball(eyes,s.eyeColor,[x,y-.012,z+.027],[rx*.85*eyeScale,ry*.84*eyeScale,.03],.20);
        ball(eyes,'#302c32',[x,y+.009,z+.05],[rx*.61*eyeScale,ry*.76*eyeScale,.018],.15);
        ball(eyes,'#fffaf4',[x-.027*eyeScale,y+.06*eyeScale,z+.068],[.035*eyeScale,.041*eyeScale,.012],.12);
        ball(eyes,'#fff9ed',[x+.033*eyeScale,y-.048*eyeScale,z+.065],[.016*eyeScale,.019*eyeScale,.008],.15);
        if(s.eyes==='sparkle'){tube(eyes,[[x+side*.064,y+.096,z+.009],[x+side*.103,y+.109,z],[x+side*.13,y+.141,z-.018]],.013,'#64453e');}
      }
      const browTop=cy+(s.brows==='flat'?.255:s.brows==='curious'?.32:.275);
      tube(faceGroup,[[x-.09,cy+.25,surface(x-.09,cy+.25)+.012],[x,browTop,surface(x,browTop)+.012],[x+.075,cy+.25,surface(x+.075,cy+.25)+.012]],.017,s.hairColor);
      const blushX=side*w*.64,blushY=cy-.20;const blush=mesh(faceGroup,new THREE.PlaneGeometry(.34,.23),this.blushMaterial,[blushX,blushY,surface(blushX,blushY)+.025]);blush.rotation.y=side*.53;blush.rotation.x=.13;blush.castShadow=false;blush.receiveShadow=false;
    }
    this.blushMaterial.opacity=s.blush/80;
    const noseScale=.65+s.noseSize*.007;ball(faceGroup,s.skin,[0,cy-.16,.741],[.065*noseScale,.061*noseScale,.065*noseScale],.56);
    const my=cy-.34,mz=surface(0,my)+.018;
    if(s.mouth==='smile')tube(faceGroup,[[-.073,my+.018,mz],[0,my-.022,mz+.013],[.073,my+.018,mz]],.012,'#b06c66');
    else if(s.mouth==='cat')tube(faceGroup,[[-.09,my+.01,mz],[-.047,my-.023,mz+.01],[0,my+.012,mz+.015],[.047,my-.023,mz+.01],[.09,my+.01,mz]],.012,'#b06c66');
    else if(s.mouth==='kiss'){heart(KIT,faceGroup,'#c88788',[0,my,mz],.045);}
    else if(s.mouth==='grin'||s.mouth==='tongue'){
      ball(faceGroup,'#a96562',[0,my,mz],[.085,.057,.019]);
      if(s.mouth==='grin')ball(faceGroup,'#fff6ed',[0,my+.022,mz+.014],[.065,.022,.009]);
      ball(faceGroup,'#e6a1a0',[0,my-(s.mouth==='tongue'?.043:.022),mz+.021],[.037,s.mouth==='tongue'?.036:.019,.009]);
    }else{ball(faceGroup,'#a96562',[0,my,mz],[.043,.057,.016]);ball(faceGroup,'#e6a1a0',[0,my-.022,mz+.014],[.029,.019,.008]);}
    this.buildHair(s,w,h,cy);
  }
  buildHair(s,w,h,cy){
    const parent=this.head,c=s.hairColor;const hair=new THREE.Group();parent.add(hair);this.hairGroup=hair;
    // Back hair and a separate crown create a full silhouette from every angle.
    ball(hair,c,[0,cy+.075,-.19],[w+ .075,h+.07,.61],.53);
    const cap=new THREE.SphereGeometry(1,64,32,0,Math.PI*2,0,1.18);mesh(hair,cap,mat(c,.53),[0,cy+.06,.015],[w+.09,h+.105,.71]);
    if(s.hair==='long'||s.hair==='hime'){
      for(let i=-3;i<=3;i++){const lock=ball(hair,c,[i*.205,2.02,-.32],[.23,.96,.28],.53);lock.rotation.z=-i*.036;}
      for(const side of [-1,1]){const lock=ball(hair,c,[side*(w-.025),2.28,.03],[.20,.75,.24],.53);lock.rotation.z=side*.09;}
      if(s.hair==='hime')for(const side of [-1,1])ball(hair,c,[side*(w-.10),cy-.08,.42],[.115,.46,.10],.53);
    }else if(s.hair==='buns'){
      for(const side of [-1,1]){
        ball(hair,c,[side*(w+.055),cy+.57,-.07],[.365,.365,.32],.53);
        const winding=[];for(let j=0;j<58;j++){const a=j/57*Math.PI*3.7,r=.018+.21*j/57;winding.push([side*(w+.055)+Math.cos(a)*r,cy+.57+Math.sin(a)*r,.17+.08*(1-j/57)]);}tube(hair,winding,.029,c);
      }
    }else if(s.hair==='bob'){
      for(const side of [-1,1]){const lock=ball(hair,c,[side*(w-.075),cy-.14,-.035],[.235,.59,.36],.53);lock.rotation.z=side*-.06;}
      ball(hair,c,[0,cy-.19,-.36],[w+.09,.60,.43],.53);
    }else if(s.hair==='ponytail'){
      ball(hair,c,[.45,cy+.55,-.51],[.25,.25,.26],.53);
      for(let i=0;i<3;i++){const pony=ball(hair,c,[.57+i*.08,cy+.01-i*.10,-.65],[.24,.7,.27],.53);pony.rotation.z=.27;}
      ball(hair,s.dressColor,[.49,cy+.52,-.49],[.255,.08,.27]);
    }else if(s.hair==='braids'){
      for(const side of [-1,1]){
        for(let j=0;j<6;j++){
          const x=side*(w-.06+Math.sin(j*.65)*.06),y=cy-.29-j*.17;
          const braid=ball(hair,c,[x,y,.025],[.17-j*.013,.16,.19-j*.013],.53);braid.rotation.z=side*(j%2?.35:-.35);
        }
        bow(hair,s.dressColor,side*(w-.04),cy-1.2,.045,.40);
      }
    }else if(s.hair==='pixie'){
      for(const side of [-1,1]){const short=ball(hair,c,[side*(w-.03),cy+.13,.12],[.16,.39,.25],.53);short.rotation.z=side*-.2;}
    }else if(s.hair==='curls'){
      for(const side of [-1,1])for(let i=0;i<6;i++){const curl=ball(hair,c,[side*(w-.03+Math.sin(i)*.055),cy+.16-i*.18,-.03],[.235,.215,.23],.53);curl.rotation.z=side*.1;}
      for(let i=0;i<7;i++)ball(hair,c,[(i-3)*.21,cy-.38,-.40],[.23,.50,.28],.53);
    }else if(s.hair==='twintails'){
      for(const side of [-1,1]){ball(hair,c,[side*(w+.06),cy+.35,-.28],[.21,.25,.23],.53);for(let i=0;i<3;i++){const tail=ball(hair,c,[side*(w+.12+i*.035),cy-.22-i*.11,-.26],[.17,.60,.20],.53);tail.rotation.z=side*.23;}bow(hair,s.accentColor,side*(w+.08),cy+.22,-.035,.4);}
    }else if(s.hair==='sidebraid'){
      for(let i=0;i<8;i++){const braid=ball(hair,c,[w-.05+Math.sin(i*.7)*.08,cy-.15-i*.17,.03],[.18-i*.01,.15,.17],.53);braid.rotation.z=i%2?.35:-.35;}bow(hair,s.accentColor,w-.12,cy-1.4,.045,.38);
    }
    // A continuous sculpted fringe hugs the head; a scalloped edge rounds each lock.
    const fringePositions=[],fringeIndices=[],edge=[];
    const fringePoint=(phi,t)=>{
      const end=1.16+.12*(.5+.5*Math.cos(phi*8+.7))+.14*Math.abs(phi);
      const theta=.22+(end-.22)*t;
      return [Math.sin(phi)*Math.sin(theta)*(w+.095),cy+.06+Math.cos(theta)*(h+.11),.035+Math.cos(phi)*Math.sin(theta)*.735];
    };
    for(let j=0;j<=24;j++)for(let i=0;i<=64;i++){
      const phi=-1.34+i/64*2.68;fringePositions.push(...fringePoint(phi,j/24));
      if(j===24)edge.push(fringePoint(phi,1));
      if(j<24&&i<64){const n=j*65+i;fringeIndices.push(n,n+65,n+1,n+1,n+65,n+66);}
    }
    const fringe=new THREE.BufferGeometry();fringe.setAttribute('position',new THREE.Float32BufferAttribute(fringePositions,3));fringe.setIndex(fringeIndices);fringe.computeVertexNormals();const fringeMat=mat(c,.53);fringeMat.side=THREE.DoubleSide;mesh(hair,fringe,fringeMat);tube(hair,edge,.022,c);
    for(const phi of [-.93,-.50,-.08,.35,.78]){
      const strand=[];for(let j=0;j<=12;j++){const point=fringePoint(phi+.09*(1-j/12),.25+j/12*.69);point[2]+=.006;strand.push(point);}tube(hair,strand,.007,c);
    }
    for(const side of [-1,1]){const sideburn=ball(hair,c,[side*(w-.055),cy+.17,.30],[.115,.31,.17],.53);sideburn.rotation.z=side*.18;}
  }
  buildAccessories(s){
    const parent=this.head,{w,cy}=this.faceInfo;
    if(s.accessory==='bows'){
      for(const side of [-1,1]){const b=bow(parent,s.dressColor,side*(s.hair==='buns'?w+.065:w-.025),cy+(s.hair==='buns'?.58:.41),s.hair==='buns'?.26:.47,s.hair==='buns'?.85:.65);b.rotation.z=side*-.28;}
    }else if(s.accessory==='flower'){
      const a=flower(parent,w-.055,cy+.38,.53,.95);a.rotation.z=-.2;flower(parent,w-.17,cy+.62,.46,.5);
    }else if(s.accessory==='bunny'){
      for(const side of [-1,1]){
        const ear=new THREE.Group();ear.position.set(side*.36,cy+.83,-.015);ear.rotation.z=-side*.16;parent.add(ear);
        ball(ear,'#fff7f0',[0,.32,0],[.14,.46,.115]);ball(ear,'#e7b5c3',[0,.33,.094],[.075,.31,.029]);
      }
      const points=[];for(let i=0;i<=20;i++){const a=i/20*Math.PI;points.push([Math.cos(a)*w*.93,cy+.12+Math.sin(a)*.86,.03]);}tube(parent,points,.045,'#e7b5c3');
    }else if(s.accessory==='crown'){
      const crown=new THREE.Group();crown.position.set(0,cy+.84,.02);parent.add(crown);
      mesh(crown,new THREE.CylinderGeometry(.31,.285,.13,48,1,true),mat('#e7c584',.35,.15),[0,0,0]);
      for(let i=0;i<7;i++){const a=i/7*Math.PI*2;const cone=mesh(crown,new THREE.ConeGeometry(.075,.20,4),mat('#e7c584',.35,.15),[Math.sin(a)*.28,.14,Math.cos(a)*.28]);cone.rotation.y=a;ball(crown,'#f5dca8',[Math.sin(a)*.28,.25,Math.cos(a)*.28],[.03,.03,.03]);}
      star(crown,'#fff0c5',0,.12,.3,.065);
    }else if(s.accessory==='glasses'){
      const space=.245+(s.eyeSpace-50)*.0014;
      for(const side of [-1,1])mesh(parent,new THREE.TorusGeometry(.19,.017,10,48),mat('#bf869d',.32,.3),[side*space,cy+.015,.797]);
      tube(parent,[[-space+.18,cy+.035,.797],[0,cy+.066,.80],[space-.18,cy+.035,.797]],.014,'#bf869d');
      for(const side of [-1,1])tube(parent,[[side*(space+.19),cy+.02,.794],[side*(w-.01),cy+.045,.42],[side*w,cy+.035,.04]],.015,'#bf869d');
    }
  }
  setView(view){this.view=view;}
  resetCamera(){this.targetAngle=0;}
  animate(){
    if(this.disposed)return;this.frame=requestAnimationFrame(()=>this.animate());
    if(document.hidden)return;
    const t=(performance.now()-this.start)/1000;
    if(Math.abs(this.targetAngle-this.angle)>.002||this.bounce>.1)this.renderer.shadowMap.needsUpdate=true;
    this.angle+=(this.targetAngle-this.angle)*.12;
    this.avatar.rotation.y=this.angle;
    if(this.state?.pose==='dance'&&!this.reduced)this.avatar.rotation.z=Math.sin(t*2.1)*.035;
    if(this.state?.pose==='wave'&&!this.reduced&&this.rightArm)this.rightArm.rotation.z=2.25+Math.sin(t*3)*.09;
    for(const particle of this.particles){const seed=particle.userData.seed;particle.position.y=particle.userData.baseY+(this.reduced?0:Math.sin(t*.65+seed)*.13);if(!this.reduced)particle.rotation.z=t*.12+seed;}
    this.bounce*=.93;
    this.avatar.position.y=this.reduced?0:Math.sin(t*1.9)*.012+Math.abs(Math.sin(this.bounce*Math.PI*3))*.07*this.bounce;
    const face=this.view==='face';this.zoom+=((face?1.73:1)-this.zoom)*.1;
    this.camera.zoom=this.zoom;this.camera.updateProjectionMatrix();
    const targetY=face?2.65:1.55;this.lookY=(this.lookY??1.55)+(targetY-(this.lookY??1.55))*.1;
    this.camera.position.y=this.lookY+1.0;this.camera.lookAt(0,this.lookY,0);
    this.renderer.render(this.scene,this.camera);
  }
  snapshot({size=1000,card=true,portrait=false}={}){
    const output=document.createElement('canvas');output.width=size;output.height=card?Math.round(size*1.18):size;
    const context=output.getContext('2d');const bg=BACKGROUNDS[this.state.background];
    const gradient=context.createLinearGradient(0,0,0,output.height);gradient.addColorStop(0,bg.top);gradient.addColorStop(1,bg.bottom);context.fillStyle=gradient;context.fillRect(0,0,output.width,output.height);
    context.strokeStyle='#ffffff88';context.lineWidth=size*.002;context.beginPath();context.arc(size/2,size*.48,size*.36,0,Math.PI*2);context.stroke();
    const oldAspect=this.camera.aspect,oldZoom=this.camera.zoom,oldY=this.camera.position.y,oldRotation=this.avatar.rotation.y;
    const oldSize=this.renderer.getSize(new THREE.Vector2()),pixelRatio=this.renderer.getPixelRatio();
    try{
      this.renderer.setPixelRatio(1);this.renderer.setSize(size,size,false);this.camera.aspect=1;this.camera.zoom=portrait?2.05:1.10;this.camera.position.y=portrait?3.75:2.91;this.camera.lookAt(0,portrait?2.75:1.91,0);this.camera.updateProjectionMatrix();this.avatar.rotation.y=this.angle;this.renderer.render(this.scene,this.camera);
      context.drawImage(this.canvas,0,card?size*.025:0,size,size);
      if(card){context.textAlign='center';context.fillStyle='#86616e';context.font=`600 ${size*.035}px "Microsoft YaHei", sans-serif`;context.fillText(this.state.name,size/2,size*1.035);context.fillStyle='#b18d9d';context.font=`${size*.012}px "Microsoft YaHei", sans-serif`;context.fillText('绒 绒 造 梦 屋   ·   FLUFFY DREAM STUDIO',size/2,size*1.092);context.font=`${size*.012}px "Microsoft YaHei", sans-serif`;context.fillText('每一种模样，都值得被喜欢。',size/2,size*1.132);}
      if(card)drawPhotoFrame(context,size,output.height,this.state);
      return output.toDataURL('image/png');
    }finally{this.renderer.setPixelRatio(pixelRatio);this.renderer.setSize(oldSize.x,oldSize.y,false);this.camera.aspect=oldAspect;this.camera.zoom=oldZoom;this.camera.position.y=oldY;this.camera.lookAt(0,this.lookY,0);this.camera.updateProjectionMatrix();this.avatar.rotation.y=oldRotation;this.renderer.render(this.scene,this.camera);}
  }
}
