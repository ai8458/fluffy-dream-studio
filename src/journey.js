import { normalizeState, REWARDS } from './state.js?v=2.0.0';

const rule=(label,key,values)=>({label,key,values});
export const THEMES=[
  {id:'picnic',title:'森林野餐日',subtitle:'小兔准备了野餐篮，等你带着春天来。',symbol:'❀',color:'#e6eedc',rules:[rule('穿背带装、围裙或探险装','outfit',['overalls','picnic','explorer']),rule('用薄荷绿或奶油黄','dressColor',['#a4bb9b','#e8c37e']),rule('戴花朵、草帽或蝴蝶结','accessory',['flower','sunhat','bows']),rule('带一束花或一只小熊','handheld',['bouquet','teddy'])]},
  {id:'starlight',title:'星月音乐会',subtitle:'今晚的舞台上，每一颗小星星都在发光。',symbol:'✦',color:'#e9e1f3',rules:[rule('穿公主裙、芭蕾裙或魔法袍','outfit',['princess','ballet','magician']),rule('用香芋紫或晴空蓝','dressColor',['#b0a0cb','#91b2cf']),rule('贴上星星或雪花','paint',['stars','snow']),rule('带魔法棒或星空日记','handheld',['wand','book'])]},
  {id:'rain',title:'雨后彩虹桥',subtitle:'雨滴邀请你出门，找一找藏起来的彩虹。',symbol:'☂',color:'#e0edf0',rules:[rule('穿雨滴斗篷或兔兔卫衣','outfit',['raincoat','hoodie']),rule('穿小雨靴','shoes',['boots']),rule('带上彩色小伞','handheld',['umbrella']),rule('选择彩虹彩绘或阳光雀斑','paint',['rainbow','freckles'])]},
  {id:'tea',title:'樱花茶会',subtitle:'在花树下坐一会儿，听春风讲一个故事。',symbol:'✿',color:'#f5e0e7',rules:[rule('穿汉服、花瓣裙或围裙','outfit',['hanfu','fairy','picnic']),rule('用草莓粉、云朵白或玫瑰红','dressColor',['#d989a4','#f0e4d8','#ad6e79']),rule('选择樱花或蝴蝶彩绘','paint',['blossom','butterfly']),rule('配上小花或星星耳夹','earrings',['flower','star'])]},
  {id:'ocean',title:'海底音乐盒',subtitle:'人鱼寄来一枚贝壳，里面有大海的声音。',symbol:'≈',color:'#dcefeb',rules:[rule('穿人鱼裙、水手装或仙子裙','outfit',['mermaid','sailor','fairy']),rule('用晴空蓝、海盐青或香芋紫','dressColor',['#91b2cf','#7898a2','#b0a0cb']),rule('戴上珍珠项链','necklace',['pearl']),rule('让梦幻泡泡环绕舞台','effect',['bubbles'])]},
  {id:'space',title:'银河小邮差',subtitle:'把这封写满好心情的信，送到月亮上。',symbol:'☾',color:'#e4e6f6',rules:[rule('穿太空装或魔法学徒装','outfit',['astronaut','magician']),rule('选择星星图案','pattern',['stars']),rule('戴耳机、皇冠或流星发夹','accessory',['headphones','crown','starclip']),rule('带上星空日记','handheld',['book'])]},
  {id:'snow',title:'雪夜热可可',subtitle:'小熊正在煮热可可，记得穿得暖暖的。',symbol:'❄',color:'#e6edf6',rules:[rule('穿雪绒大衣、毛衣或卫衣','outfit',['winter','cozy','hoodie']),rule('围上软软围巾','necklace',['scarf']),rule('穿小雨靴或兔兔拖鞋','shoes',['boots','bunny']),rule('选择雪花或爱心贴纸','paint',['snow','hearts'])]},
  {id:'sport',title:'草地运动会',subtitle:'今天的目标：开心出发，和朋友一起加油。',symbol:'⚑',color:'#e8eedf',rules:[rule('穿探险装、卫衣或背带装','outfit',['explorer','hoodie','overalls']),rule('穿上运动鞋','shoes',['sneakers']),rule('梳马尾、双马尾或短发','hair',['ponytail','twintails','bob','pixie']),rule('摆出挥手或起舞姿势','pose',['wave','dance'])]},
  {id:'artist',title:'猫咪画室',subtitle:'小猫的画室开张啦，来做一幅会微笑的画。',symbol:'♧',color:'#eee3d9',rules:[rule('戴贝雷帽或猫猫耳朵','accessory',['beret','cat']),rule('画上猫咪胡须','paint',['whiskers']),rule('穿围裙、毛衣或背带装','outfit',['picnic','cozy','overalls']),rule('选条纹、格纹或小花图案','pattern',['stripes','gingham','flowers'])]},
  {id:'fairy',title:'蝴蝶的来信',subtitle:'花园里的小门打开了，欢迎做客精灵世界。',symbol:'ʚɞ',color:'#e7eddf',rules:[rule('穿花瓣裙、汉服或公主裙','outfit',['fairy','hanfu','princess']),rule('戴上云朵或叶子翅膀','wings',['angel','leaf','butterfly']),rule('画蝴蝶或樱花彩绘','paint',['butterfly','blossom']),rule('让花瓣纷飞','effect',['petals'])]},
  {id:'sweet',title:'糖果生日会',subtitle:'不用等生日，也可以庆祝今天的小小快乐。',symbol:'♡',color:'#f5e0e8',rules:[rule('穿草莓裙、芭蕾裙或公主裙','outfit',['strawberry','ballet','princess']),rule('选择爱心或波点图案','pattern',['hearts','dots']),rule('拿爱心气球或口袋小熊','handheld',['balloon','teddy']),rule('选择爱心或彩虹贴纸','paint',['hearts','rainbow'])]},
  {id:'graduation',title:'梦想毕业礼',subtitle:'把你的灵感装进行李，下一场故事由你写。',symbol:'♔',color:'#eee7d5',rules:[rule('穿魔法袍、公主裙或水手装','outfit',['magician','princess','sailor','stardust','rainbow']),rule('戴皇冠、流星发夹或独角兽角','accessory',['crown','starclip','unicorn']),rule('带星空日记或魔法棒','handheld',['book','wand']),rule('选择星光相框','frame',['stars'])]}
];

export function evaluateTheme(id,state){
  const theme=THEMES.find(theme=>theme.id===id);
  if(!theme)return {score:0,rules:[]};
  const rules=theme.rules.map(rule=>({...rule,met:rule.values.includes(state[rule.key])}));
  return {score:rules.filter(rule=>rule.met).length,rules};
}
export function normalizeProgress(value){
  const result={version:2,active:'picnic',playing:false,best:{},album:{}};
  if(!value||typeof value!=='object')return result;
  if(THEMES.some(theme=>theme.id===value.active))result.active=value.active;
  result.playing=value.playing===true;
  for(const theme of THEMES){
    const score=value.best?.[theme.id];
    if(Number.isInteger(score)&&score>=0&&score<=4)result.best[theme.id]=score;
    const entry=value.album?.[theme.id];
    if(result.best[theme.id]===4&&entry&&typeof entry.image==='string'&&/^data:image\/(png|jpeg);base64,/.test(entry.image))result.album[theme.id]={state:normalizeState(entry.state),image:entry.image,date:typeof entry.date==='string'?entry.date.slice(0,30):''};
  }
  return result;
}
export function completedCount(progress){return THEMES.filter(theme=>progress.best[theme.id]===4).length;}
export function starCount(progress){return THEMES.reduce((sum,theme)=>sum+(progress.best[theme.id]||0),0);}
export function designerTitle(progress){const n=completedCount(progress);return n>=12?'绒绒造梦师':n>=9?'星光造型师':n>=6?'梦境设计师':n>=4?'灵感收藏家':n>=2?'配色小画家':'新芽造型师';}
export function submitLook(progress,id,state,image,date=new Date().toISOString()){
  const next=normalizeProgress(progress),before=completedCount(next),evaluation=evaluateTheme(id,state);
  if(!THEMES.some(theme=>theme.id===id))return {progress:next,evaluation,newStamp:false,rewards:[]};
  const newStamp=evaluation.score===4&&next.best[id]!==4;
  next.best[id]=Math.max(next.best[id]||0,evaluation.score);
  if(evaluation.score===4&&typeof image==='string'&&/^data:image\/(png|jpeg);base64,/.test(image))next.album[id]={state:normalizeState(state),image,date};
  const after=completedCount(next),rewards=REWARDS.filter(reward=>reward.need>before&&reward.need<=after);
  return {progress:next,evaluation,newStamp,rewards};
}
