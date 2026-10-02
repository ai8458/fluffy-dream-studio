export const DEFAULT = Object.freeze({ name:'草莓绒绒', face:'round', skin:'#f5d5bf', faceWidth:50, cheek:55, chin:40, hair:'buns', hairColor:'#765044', eyes:'sparkle', eyeColor:'#65443d', eyeSize:55, eyeSpace:50, mouth:'smile', blush:55, outfit:'strawberry', dressColor:'#d989a4', accessory:'bows', background:'peach', paint:'none',paintColor:'#ce7b98',paintOpacity:70,noseSize:50,brows:'soft',pattern:'none',accentColor:'#fff0cf',shoes:'maryjane',eyewear:'none',earrings:'none',necklace:'none',handheld:'none',wings:'none',pose:'stand',effect:'none',frame:'classic' });
export const OPTIONS = {
  face:[['round','软糯圆脸'],['oval','乖巧鹅蛋'],['heart','甜心小脸'],['cheeky','团子脸'],['petal','花瓣小脸'],['bean','小豆脸'],['peach','蜜桃脸'],['bubble','泡泡脸'],['elf','小精灵脸']],
  hair:[['buns','双丸子头'],['bob','奶糖短发'],['long','云朵长发'],['ponytail','元气马尾'],['braids','软软双辫'],['pixie','精灵短发'],['curls','棉花卷卷'],['twintails','双马尾'],['hime','姬式长发'],['sidebraid','侧边麻花']],
  eyes:[['sparkle','星星眼'],['round','圆圆眼'],['gentle','月牙眼'],['wink','俏皮眨眼'],['sleepy','慵懒眼'],['heart','爱心眼']],
  mouth:[['smile','甜甜微笑'],['cat','小猫嘴'],['oh','惊喜嘟嘴'],['grin','开心大笑'],['tongue','调皮吐舌'],['kiss','啵啵嘴']],
  brows:[['soft','柔柔弯眉'],['flat','平平小眉'],['curious','好奇挑眉']],
  outfit:[['strawberry','草莓小裙'],['sailor','海盐水手'],['overalls','花园背带'],['princess','星光公主'],['cozy','软软毛衣'],['ballet','芭蕾甜心'],['raincoat','雨滴斗篷'],['hoodie','兔兔卫衣'],['hanfu','花间汉服'],['fairy','花瓣仙子'],['astronaut','太空邮递员'],['explorer','森林探险家'],['winter','雪绒大衣'],['mermaid','人鱼之歌'],['picnic','野餐围裙'],['magician','魔法学徒'],['stardust','星河礼服'],['rainbow','彩虹庆典']],
  pattern:[['none','纯色'],['dots','波点'],['stripes','条纹'],['gingham','格纹'],['hearts','爱心'],['stars','星星'],['flowers','小花']],
  shoes:[['maryjane','玛丽珍鞋'],['sneakers','运动鞋'],['boots','小雨靴'],['ballet','芭蕾鞋'],['bunny','兔兔拖鞋']],
  accessory:[['bows','蝴蝶结'],['flower','小雏菊'],['bunny','兔兔耳朵'],['crown','星星皇冠'],['cat','猫猫耳朵'],['beret','画家贝雷帽'],['sunhat','野餐草帽'],['headphones','糖果耳机'],['starclip','流星发夹'],['unicorn','独角兽角'],['none','简单就好']],
  paint:[['none','素净脸蛋'],['freckles','阳光雀斑'],['stars','星星贴纸'],['hearts','爱心贴纸'],['whiskers','猫咪胡须'],['butterfly','蝴蝶彩绘'],['rainbow','小小彩虹'],['blossom','樱花贴纸'],['snow','雪花印记']],
  eyewear:[['none','不戴眼镜'],['round','圆圆眼镜'],['flower','花花眼镜'],['star','星星眼镜'],['heart','爱心眼镜']],
  earrings:[['none','不戴耳饰'],['pearl','珍珠耳夹'],['star','小星星'],['cherry','樱桃耳夹'],['flower','雏菊耳夹']],
  necklace:[['none','不戴颈饰'],['bow','领口蝴蝶结'],['scarf','软软围巾'],['pearl','珍珠项链'],['bell','小铃铛']],
  handheld:[['none','空空小手'],['wand','星星魔法棒'],['balloon','爱心气球'],['teddy','口袋小熊'],['bouquet','一束小花'],['umbrella','彩色小伞'],['book','星空日记']],
  wings:[['none','不戴翅膀'],['angel','云朵翅膀'],['leaf','叶子翅膀'],['butterfly','蝴蝶翅膀']],
  background:[['peach','奶油蜜桃'],['lavender','薰衣草梦'],['mint','薄荷花园'],['sky','晴空来信'],['sunset','橘子日落'],['forest','森林茶会'],['candy','糖果派对'],['aurora','极光梦境']],
  pose:[['stand','乖乖站好'],['wave','挥挥小手'],['dance','开心起舞'],['shy','抱抱自己']],
  effect:[['none','安静时光'],['sparkles','星光环绕'],['petals','花瓣纷飞'],['bubbles','梦幻泡泡']],
  frame:[['classic','温柔留白'],['polaroid','拍立得'],['stars','星光相框'],['garden','花园相框'],['candy','糖果相框']]
};
export const PALETTES = {
  skin:[['#f5d5bf','奶油杏'],['#f9e3d3','雪桃粉'],['#ecc3a4','蜜桃米'],['#d8a27c','蜂蜜棕'],['#b97e58','焦糖棕'],['#80513e','可可棕']],
  hairColor:[['#765044','栗子棕'],['#3c3039','黑莓黑'],['#b98b5d','蜂蜜金'],['#e7c596','奶油金'],['#b77484','玫瑰粉'],['#8c7caa','芋泥紫']],
  eyeColor:[['#65443d','可可棕'],['#373947','星夜黑'],['#829383','森林绿'],['#7795b6','天空蓝'],['#9580ac','葡萄紫'],['#ba8b62','琥珀金']],
  dressColor:[['#d989a4','草莓粉'],['#91b2cf','晴空蓝'],['#b0a0cb','香芋紫'],['#a4bb9b','薄荷绿'],['#e8c37e','奶油黄'],['#f0e4d8','云朵白'],['#ad6e79','玫瑰红'],['#7898a2','海盐青']],
  accentColor:[['#fff0cf','奶油白'],['#e7b66b','蜂蜜金'],['#e7a4bc','樱花粉'],['#a995c6','紫藤花'],['#82b4bc','湖水蓝'],['#93ae84','鼠尾草绿'],['#88675a','可可棕'],['#c96b82','莓果红']],
  paintColor:[['#ce7b98','玫瑰粉'],['#b193c9','星梦紫'],['#d7a452','阳光金'],['#87abbf','天空蓝'],['#87a98d','薄荷绿'],['#a57661','奶茶棕']]
};
export const REWARDS=[
  {key:'eyewear',value:'heart',need:2,title:'爱心眼镜',symbol:'♡'},
  {key:'wings',value:'butterfly',need:4,title:'蝴蝶翅膀',symbol:'ʚɞ'},
  {key:'outfit',value:'stardust',need:6,title:'星河礼服',symbol:'✧'},
  {key:'accessory',value:'unicorn',need:9,title:'独角兽角',symbol:'♢'},
  {key:'outfit',value:'rainbow',need:12,title:'彩虹庆典',symbol:'☀'},
  {key:'background',value:'aurora',need:12,title:'极光梦境',symbol:'✦'}
];
export function isUnlocked(key,value,completed=0){return !REWARDS.some(reward=>reward.key===key&&reward.value===value&&reward.need>completed);}
export const OUTFIT_GROUPS={daily:['strawberry','sailor','overalls','cozy','hoodie','picnic'],adventure:['raincoat','explorer','astronaut','winter'],fantasy:['princess','ballet','hanfu','fairy','mermaid','magician','stardust','rainbow']};
export const PRESETS = [
  {name:'草莓下午茶',sub:'甜甜的，刚刚好',bg:'#f8e7eb',state:{...DEFAULT}},
  {name:'薄荷小花园',sub:'把春天穿在身上',bg:'#edf1e7',state:{...DEFAULT,name:'薄荷啵啵',hair:'bob',hairColor:'#b98b5d',outfit:'overalls',dressColor:'#a4bb9b',accessory:'flower',background:'mint',face:'cheeky',eyes:'round'}},
  {name:'星星晚安曲',sub:'收集一口小星光',bg:'#eee9f6',state:{...DEFAULT,name:'星星糯糯',hair:'long',hairColor:'#8c7caa',outfit:'princess',dressColor:'#b0a0cb',accessory:'crown',background:'lavender',face:'heart'}},
  {name:'雨后小彩虹',sub:'踩着水花出发',bg:'#f4eddc',state:{...DEFAULT,name:'彩虹泡芙',outfit:'raincoat',dressColor:'#e8c37e',accessory:'none',hair:'bob',shoes:'boots',handheld:'umbrella',paint:'rainbow',background:'sky',effect:'bubbles'}},
  {name:'樱花小茶会',sub:'把春风藏进衣袖',bg:'#f7e8ec',state:{...DEFAULT,name:'樱花团子',outfit:'hanfu',hair:'hime',hairColor:'#3c3039',accessory:'flower',paint:'blossom',earrings:'flower',effect:'petals',frame:'garden'}},
  {name:'银河小邮差',sub:'下一站是月亮',bg:'#e8ebf7',state:{...DEFAULT,name:'星邮绒绒',outfit:'astronaut',dressColor:'#91b2cf',pattern:'stars',hair:'pixie',accessory:'headphones',handheld:'book',shoes:'boots',paint:'stars',effect:'sparkles',frame:'stars',background:'lavender'}}
];
export function normalizeState(value) {
  const result={...DEFAULT};
  if(!value || typeof value!=='object') return result;
  for(const [key,choices] of Object.entries(OPTIONS)) if(choices.some(([id])=>id===value[key])) result[key]=value[key];
  for(const [key,choices] of Object.entries(PALETTES)) if(choices.some(([id])=>id===value[key])) result[key]=value[key];
  for(const key of ['faceWidth','cheek','chin','eyeSize','eyeSpace','blush','paintOpacity','noseSize']) if(typeof value[key]==='number' && Number.isFinite(value[key])) result[key]=Math.round(Math.max(0,Math.min(100,value[key])));
  if(value.accessory==='glasses'){result.accessory='none';if(value.eyewear===undefined)result.eyewear='round';}
  if(typeof value.name==='string') result.name=value.name.replace(/[\u0000-\u001f]/g,'').slice(0,12).trim()||DEFAULT.name;
  return result;
}
export function randomState(random=Math.random,completed=0) {
  const pick=a=>a[Math.floor(random()*a.length)];
  const result={...DEFAULT};
  for(const [key,values] of Object.entries(OPTIONS)) result[key]=pick(values.filter(([id])=>isUnlocked(key,id,completed)))[0];
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
