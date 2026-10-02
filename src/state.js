export const DEFAULT = Object.freeze({ name:'草莓绒绒', face:'round', skin:'#f5d5bf', faceWidth:50, cheek:55, chin:40, hair:'buns', hairColor:'#765044', eyes:'sparkle', eyeColor:'#65443d', eyeSize:55, eyeSpace:50, mouth:'smile', blush:55, outfit:'strawberry', dressColor:'#d989a4', accessory:'bows', background:'peach' });
export const OPTIONS = {
  face:[['round','软糯圆脸'],['oval','乖巧鹅蛋'],['heart','甜心小脸'],['cheeky','团子脸'],['petal','花瓣小脸'],['bean','小豆脸']],
  hair:[['buns','双丸子头'],['bob','奶糖短发'],['long','云朵长发'],['ponytail','元气马尾'],['braids','软软双辫'],['pixie','精灵短发']],
  eyes:[['sparkle','星星眼'],['round','圆圆眼'],['gentle','月牙眼']],
  mouth:[['smile','甜甜微笑'],['cat','小猫嘴'],['oh','惊喜嘟嘴']],
  outfit:[['strawberry','草莓小裙'],['sailor','海盐水手'],['overalls','花园背带'],['princess','星光公主'],['cozy','软软毛衣'],['ballet','芭蕾甜心']],
  accessory:[['bows','蝴蝶结'],['flower','小雏菊'],['bunny','兔兔耳朵'],['crown','星星皇冠'],['glasses','圆圆眼镜'],['none','简单就好']],
  background:[['peach','奶油蜜桃'],['lavender','薰衣草梦'],['mint','薄荷花园'],['sky','晴空来信']]
};
export const PALETTES = {
  skin:[['#f5d5bf','奶油杏'],['#f9e3d3','雪桃粉'],['#ecc3a4','蜜桃米'],['#d8a27c','蜂蜜棕'],['#b97e58','焦糖棕'],['#80513e','可可棕']],
  hairColor:[['#765044','栗子棕'],['#3c3039','黑莓黑'],['#b98b5d','蜂蜜金'],['#e7c596','奶油金'],['#b77484','玫瑰粉'],['#8c7caa','芋泥紫']],
  eyeColor:[['#65443d','可可棕'],['#373947','星夜黑'],['#829383','森林绿'],['#7795b6','天空蓝'],['#9580ac','葡萄紫'],['#ba8b62','琥珀金']],
  dressColor:[['#d989a4','草莓粉'],['#91b2cf','晴空蓝'],['#b0a0cb','香芋紫'],['#a4bb9b','薄荷绿'],['#e8c37e','奶油黄'],['#f0e4d8','云朵白']]
};
export const PRESETS = [
  {name:'草莓下午茶',sub:'甜甜的，刚刚好',bg:'#f8e7eb',state:{...DEFAULT}},
  {name:'薄荷小花园',sub:'把春天穿在身上',bg:'#edf1e7',state:{...DEFAULT,name:'薄荷啵啵',hair:'bob',hairColor:'#b98b5d',outfit:'overalls',dressColor:'#a4bb9b',accessory:'flower',background:'mint',face:'cheeky',eyes:'round'}},
  {name:'星星晚安曲',sub:'收集一口小星光',bg:'#eee9f6',state:{...DEFAULT,name:'星星糯糯',hair:'long',hairColor:'#8c7caa',outfit:'princess',dressColor:'#b0a0cb',accessory:'crown',background:'lavender',face:'heart'}}
];
export function normalizeState(value) {
  const result={...DEFAULT};
  if(!value || typeof value!=='object') return result;
  for(const [key,choices] of Object.entries(OPTIONS)) if(choices.some(([id])=>id===value[key])) result[key]=value[key];
  for(const [key,choices] of Object.entries(PALETTES)) if(choices.some(([id])=>id===value[key])) result[key]=value[key];
  for(const key of ['faceWidth','cheek','chin','eyeSize','eyeSpace','blush']) if(typeof value[key]==='number' && Number.isFinite(value[key])) result[key]=Math.round(Math.max(0,Math.min(100,value[key])));
  if(typeof value.name==='string') result.name=value.name.replace(/[\u0000-\u001f]/g,'').slice(0,12).trim()||DEFAULT.name;
  return result;
}
export function randomState(random=Math.random) {
  const pick=a=>a[Math.floor(random()*a.length)];
  const result={...DEFAULT};
  for(const [key,values] of Object.entries(OPTIONS)) result[key]=pick(values)[0];
  for(const [key,values] of Object.entries(PALETTES)) result[key]=pick(values)[0];
  for(const key of ['faceWidth','cheek','chin','eyeSize','eyeSpace','blush']) result[key]=25+Math.floor(random()*51);
  result.name=pick(['桃桃','绒绒','奶糖','小莓','啵啵','糯米','星星'])+pick(['兔','酱','团子','小熊','布丁','泡芙']);
  return result;
}
export class History {
  constructor(initial){this.items=[normalizeState(initial)];this.index=0;}
  push(value){const next=normalizeState(value);if(JSON.stringify(next)===JSON.stringify(this.items[this.index]))return false;this.items=this.items.slice(0,this.index+1);this.items.push(next);if(this.items.length>60)this.items.shift();this.index=this.items.length-1;return true;}
  undo(){if(this.index>0)this.index--;return {...this.items[this.index]};}
  redo(){if(this.index<this.items.length-1)this.index++;return {...this.items[this.index]};}
  get canUndo(){return this.index>0;}
  get canRedo(){return this.index<this.items.length-1;}
}
