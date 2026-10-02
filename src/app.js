import { DEFAULT, OPTIONS, PALETTES, PRESETS, normalizeState, randomState, History } from './state.js';
import { icon, fillIcons, miniAvatar, optionIllustration } from './icons.js';
import { AvatarScene, BACKGROUNDS } from './avatar.js';

const $=selector=>document.querySelector(selector);
const escapeHtml=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const CURRENT_KEY='fluffy-dream-current-v1',GALLERY_KEY='fluffy-dream-gallery-v1';
function readStorage(key,fallback){try{return JSON.parse(localStorage.getItem(key))??fallback;}catch{return fallback;}}
let state=normalizeState(readStorage(CURRENT_KEY,DEFAULT)),category='face',avatar,toastTimer,updateFrame;
let gallery=readStorage(GALLERY_KEY,[]);
if(!Array.isArray(gallery))gallery=[];
gallery=gallery.filter(item=>item&&typeof item.id==='string'&&typeof item.image==='string'&&item.image.startsWith('data:image/png;base64,')).slice(0,12).map(item=>({...item,state:normalizeState(item.state)}));
const history=new History(state);
const categories=[['face','脸型'],['hair','发型'],['eyes','五官'],['outfit','服饰'],['accessory','配饰']];
let storageNoticeShown=false;
function toast(message){clearTimeout(toastTimer);$('#toast').textContent=message;$('#toast').classList.add('visible');toastTimer=setTimeout(()=>$('#toast').classList.remove('visible'),3200);}
function storeCurrent(){try{localStorage.setItem(CURRENT_KEY,JSON.stringify(state));}catch{if(!storageNoticeShown){toast('浏览器暂时无法保存，记得拍照留下这份可爱。');storageNoticeShown=true;}}}
function commit(){history.push(state);storeCurrent();updateHistory();}
function updateHistory(){$('[data-action="undo"]').disabled=!history.canUndo;$('[data-action="redo"]').disabled=!history.canRedo;}
function updateAvatar(){cancelAnimationFrame(updateFrame);updateFrame=requestAnimationFrame(()=>{if(avatar)avatar.update(state);});}
function setState(value,{record=true}={}){state=normalizeState(value);$('#avatar-name').value=state.name;updateAvatar();renderPanel();if(record)commit();else{storeCurrent();updateHistory();}}
function section(title,body,subtitle='',value=''){return `<section class="control-section"><div class="section-title"><h3>${title}${subtitle?`<em>${subtitle}</em>`:''}</h3>${value?`<span class="section-value">${value}</span>`:''}</div>${body}</section>`;}
function choices(key,extra=''){return `<div class="choice-grid ${extra}" role="group" aria-label="${({face:'选择脸型',hair:'选择发型',eyes:'选择眼睛',mouth:'选择嘴型',outfit:'选择服饰',accessory:'选择配饰'})[key]}">${OPTIONS[key].map(([id,label])=>`<button class="choice-tile ${state[key]===id?'active':''}" data-choice="${key}" data-value="${id}" aria-pressed="${state[key]===id}" aria-label="${label}">${optionIllustration(key,id,state)}<span>${label}</span></button>`).join('')}</div>`;}
function swatches(key){return `<div class="swatch-list" role="group" aria-label="${key==='skin'?'肤色':key==='hairColor'?'发色':key==='dressColor'?'服饰颜色':'瞳色'}">${PALETTES[key].map(([color,label],index)=>`<button class="swatch ${state[key]===color?'active':''}" style="--swatch:${color};--check:${(key==='skin'&&index<3)||(key==='dressColor'&&index>3)?'#a57563':'#fff'}" data-choice="${key}" data-value="${color}" aria-label="${label}" aria-pressed="${state[key]===color}" title="${label}"></button>`).join('')}</div>`;}
function slider(key,label,left,right){return `<div class="slider-row"><label class="slider-label" for="${key}">${label}<output for="${key}" id="${key}-value">${state[key]}</output></label><input type="range" min="0" max="100" value="${state[key]}" id="${key}" data-slider="${key}" style="--fill:${state[key]}%"><div class="range-endpoints"><span>${left}</span><span>${right}</span></div></div>`;}
function tip(text){return `<div class="tip-box">${icon('sparkles')}<span>${text}</span></div>`;}
function colorName(key){return PALETTES[key].find(([c])=>c===state[key])?.[1]||'';}
function renderTabs(){
  $('#category-tabs').innerHTML=categories.map(([id,label],index)=>`<button id="tab-${id}" class="category-tab ${category===id?'active':''}" role="tab" aria-selected="${category===id}" aria-controls="controls-panel" tabindex="${category===id?0:-1}" data-category="${id}">${icon(id)}<span>${label}</span></button>`).join('');
  $('#controls-panel').setAttribute('aria-labelledby',`tab-${category}`);$('#step-badge').textContent=`0${categories.findIndex(([id])=>id===category)+1} / 05`;
}
function renderPanel(){
  let html='';
  if(category==='face')html=section('选一个小脸蛋',choices('face'),'6 种可爱')+section('肤色',swatches('skin'),'',colorName('skin'))+'<hr class="control-rule">'+section('再捏一捏',slider('faceWidth','脸蛋宽度','窄一点','圆一点')+slider('cheek','脸颊饱满度','软软的','糯糯的')+slider('chin','下巴弧度','圆润','精巧'))+tip('轻轻拖动滑杆就能捏脸。每一点小变化，都是你的独家可爱。');
  if(category==='hair')html=section('今天梳什么发型',choices('hair'),'6 款发型')+section('染一抹喜欢的颜色',swatches('hairColor'),'',colorName('hairColor'))+'<hr class="control-rule">'+tip('试试转到背面看看，丸子头、长发和小辫子都有自己的小细节。再到「配饰」加一只蝴蝶结吧！');
  if(category==='eyes')html=section('眼睛里藏着小星星',choices('eyes'))+section('瞳色',swatches('eyeColor'),'',colorName('eyeColor'))+section('一点点小调整',slider('eyeSize','眼睛大小','小巧','闪亮')+slider('eyeSpace','眼睛间距','靠近','散开'))+'<hr class="control-rule">'+section('一个甜甜的表情',choices('mouth'))+section('脸颊红扑扑',slider('blush','腮红浓度','淡淡的','粉扑扑'));
  if(category==='outfit')html=section('穿上今天的好心情',choices('outfit'),'6 套穿搭')+section('裙子的颜色',swatches('dressColor'),'',colorName('dressColor'))+'<hr class="control-rule">'+tip('每套衣服都有自己的小细节：草莓贴布、小花口袋、星星裙摆……鞋子也会跟着换颜色哦。');
  if(category==='accessory')html=section('小小配饰，大大可爱',choices('accessory','accessory-grid'))+'<hr class="control-rule">'+section('换一个梦境背景',`<div class="swatch-list" role="group" aria-label="舞台背景">${OPTIONS.background.map(([id,label])=>`<button class="swatch ${state.background===id?'active':''}" style="--swatch:${BACKGROUNDS[id].bottom}" data-choice="background" data-value="${id}" aria-label="${label}" aria-pressed="${state.background===id}" title="${label}"></button>`).join('')}</div>`,'',OPTIONS.background.find(([id])=>id===state.background)[1])+tip('小皇冠、兔兔耳朵或一朵小雏菊，挑一件最像你的。按舞台左下角的相机，就能保存专属照片。');
  $('#controls-panel').innerHTML=html;
}
function chooseCategory(next){category=next;renderTabs();renderPanel();$('#controls-panel').scrollTop=0;}
function renderPresets(){$('#preset-list').innerHTML=PRESETS.map((preset,index)=>`<button class="preset-card" data-preset="${index}" aria-label="穿上${preset.name}"><span class="preset-image" style="--preset-bg:${preset.bg}">${miniAvatar(preset.state)}</span><span><strong>${preset.name}</strong><small>${preset.sub}</small></span><span class="preset-arrow">↗</span></button>`).join('');}
function showModal(html){$('#modal-content').innerHTML=html;if(!$('#modal').open)$('#modal').showModal();}
function closeModal(){$('#modal').close();}
function updateCount(){$('#collection-count').textContent=gallery.length;}
function renderGallery(){
  showModal(`<span class="eyebrow">YOUR LITTLE TREASURES</span><h2 class="modal-title">我的可爱收藏夹 ♡</h2><p class="modal-subtitle">把喜欢的模样好好收起来。已收藏 ${gallery.length} / 12 个小可爱，保存在当前浏览器中。</p>${gallery.length?`<div class="gallery-grid">${gallery.map(item=>`<article class="saved-card"><img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.state.name)}的造型"><div><strong>${escapeHtml(item.state.name)}</strong><div class="saved-actions"><button data-load="${escapeHtml(item.id)}">继续打扮</button><button class="delete-saved" data-delete="${escapeHtml(item.id)}" aria-label="移除${escapeHtml(item.state.name)}">移除</button></div></div></article>`).join('')}</div>`:'<div class="empty-state"><span>♡</span>这里还没有小可爱。<br>完成造型后，点右上角「收藏这份可爱」吧！</div>'}`);
}
function saveAvatar(){
  if(!avatar)return;
  if(gallery.length>=12){renderGallery();toast('收藏夹住满啦，先移除一个旧造型再收藏吧。');return;}
  commit();
  avatar.update(state);
  const item={id:`${Date.now()}-${Math.random().toString(36).slice(2,8)}`,state:{...state},image:avatar.snapshot({size:360,card:false})};
  const next=[item,...gallery];
  try{localStorage.setItem(GALLERY_KEY,JSON.stringify(next));gallery=next;updateCount();toast(`♡ 已收藏「${state.name}」，在「我的收藏」里等你。`);avatar.bounce=1;}catch{toast('收藏空间暂时不足，可以先拍照下载，或清理旧收藏。');}
}
function photo(){
  if(!avatar)return;
  try{avatar.update(state);const data=avatar.snapshot();const a=document.createElement('a');a.download=`绒绒造梦屋-${state.name.replace(/[<>:"/\\|?*]/g,'')||'小可爱'}.png`;a.href=data;document.body.appendChild(a);a.click();a.remove();$('#photo-flash').classList.remove('flash');void $('#photo-flash').offsetWidth;$('#photo-flash').classList.add('flash');toast('咔嚓！专属小照片已准备好下载。');}catch{toast('拍照暂时没有成功，请稍后再试一次。');}
}
let audioContext,musicTimer,musicOn=false;
const melody=[523.25,659.25,783.99,659.25,587.33,698.46,880,783.99,659.25,783.99,1046.5,987.77,880,783.99,659.25,587.33];
async function toggleMusic(){
  try{
    if(!audioContext)audioContext=new(window.AudioContext||window.webkitAudioContext)();
    if(musicOn){clearTimeout(musicTimer);await audioContext.suspend();musicOn=false;}
    else{await audioContext.resume();musicOn=true;let step=0;const play=()=>{if(!musicOn)return;const now=audioContext.currentTime;for(const [frequency,volume] of [[melody[step%melody.length],.025],[melody[step%melody.length]/2,.015]]){const oscillator=audioContext.createOscillator(),gain=audioContext.createGain();oscillator.type='sine';oscillator.frequency.value=frequency;gain.gain.setValueAtTime(0,now);gain.gain.linearRampToValueAtTime(volume,now+.025);gain.gain.exponentialRampToValueAtTime(.0001,now+1.1);oscillator.connect(gain);gain.connect(audioContext.destination);oscillator.start(now);oscillator.stop(now+1.15);}step++;musicTimer=setTimeout(play,560);};play();}
    const button=$('[data-action="sound"]');button.innerHTML=icon(musicOn?'sound':'sound-off');button.setAttribute('aria-label',musicOn?'关闭音乐':'开启音乐');button.title=musicOn?'关闭音乐':'开启音乐';button.setAttribute('aria-pressed',String(musicOn));toast(musicOn?'轻轻的音乐，陪你慢慢捏。':'音乐已关闭');
  }catch{toast('当前浏览器暂时无法播放音乐，其他玩法不受影响。');}
}
function showHelp(){showModal(`<span class="eyebrow">A TINY GUIDE TO HAPPINESS</span><h2 class="modal-title">欢迎来到绒绒造梦屋 ✦</h2><p class="modal-subtitle">没有任务，没有分数。只要慢慢玩，做一个自己喜欢的小可爱。</p><div class="help-list">${[['捏一张软软的小脸','点击右侧分类，选择脸型、发型、五官、衣服和配饰。轻轻拖动滑杆，娃娃就会跟着变。'],['换个角度，发现小细节','在娃娃身上左右拖动就能旋转，点「特写」可以近距离看脸。点一下娃娃，她会开心地跳一跳。'],['给灵感一点小魔法','「来点小惊喜」会随机搭配；「灵感小衣橱」有三套现成造型。用撤销、重做按钮，随时回到喜欢的一步。'],['为她起名字，留下这份可爱','点击娃娃下面的名字就能改名。点相机下载 PNG 照片；点右上角的爱心收藏造型，最多可以存 12 个。']].map(([title,body],i)=>`<div class="help-item"><span class="help-number">0${i+1}</span><div><strong>${title}</strong><p>${body}</p></div></div>`).join('')}</div><p class="keyboard-hint">键盘也能玩：Tab 选择控件，方向键调整滑杆；选中舞台后，← → 旋转，Home 回到正面。<br><br>造型自动保存在当前浏览器。清除浏览器数据会清空收藏，请拍照备份喜欢的作品。</p>`);}

document.addEventListener('click',event=>{
  const button=event.target.closest('button');if(!button||button.disabled)return;
  if(button.dataset.category){chooseCategory(button.dataset.category);$(`#tab-${category}`).focus({preventScroll:true});return;}
  if(button.dataset.choice){state={...state,[button.dataset.choice]:button.dataset.value};updateAvatar();commit();const focusKey=button.dataset.choice,focusValue=button.dataset.value;renderPanel();$(`[data-choice="${focusKey}"][data-value="${focusValue}"]`)?.focus({preventScroll:true});return;}
  if(button.dataset.preset!==undefined){setState(PRESETS[Number(button.dataset.preset)].state);if(avatar)avatar.bounce=1;toast(`已换上「${PRESETS[Number(button.dataset.preset)].name}」`);return;}
  if(button.dataset.view){avatar?.setView(button.dataset.view);document.querySelectorAll('[data-view]').forEach(el=>{el.classList.toggle('active',el===button);el.setAttribute('aria-pressed',String(el===button));});return;}
  if(button.dataset.load){const item=gallery.find(item=>item.id===button.dataset.load);if(item){setState(item.state);closeModal();toast(`欢迎回来，${item.state.name}！`);}return;}
  if(button.dataset.delete){const item=gallery.find(item=>item.id===button.dataset.delete);if(item)showModal(`<span class="eyebrow">MAKE A LITTLE ROOM</span><h2 class="modal-title">移除这份收藏？</h2><p class="modal-subtitle">「${escapeHtml(item.state.name)}」将离开收藏夹。当前正在编辑的娃娃不受影响。</p><div class="modal-buttons"><button class="button secondary" data-action="gallery">再想一想</button><button class="button primary" data-confirm-delete="${escapeHtml(item.id)}">移除收藏</button></div>`);return;}
  if(button.dataset.confirmDelete){const next=gallery.filter(item=>item.id!==button.dataset.confirmDelete);try{localStorage.setItem(GALLERY_KEY,JSON.stringify(next));gallery=next;updateCount();renderGallery();toast('已腾出一个小位置。');}catch{toast('暂时无法移除收藏，请稍后再试。');}return;}
  const action=button.dataset.action;
  if(action==='save')saveAvatar();
  else if(action==='gallery')renderGallery();
  else if(action==='help')showHelp();
  else if(action==='sound')toggleMusic();
  else if(action==='close-modal')closeModal();
  else if(action==='photo')photo();
  else if(action==='random'){setState(randomState());if(avatar){avatar.bounce=1;avatar.resetCamera();}toast('✦ 叮！一只意想不到的小可爱出现了。');}
  else if(action==='undo'){setState(history.undo(),{record:false});}
  else if(action==='redo'){setState(history.redo(),{record:false});}
  else if(action==='reset'){showModal('<span class="eyebrow">A FRESH LITTLE START</span><h2 class="modal-title">重新捏一个小可爱？</h2><p class="modal-subtitle">造型会恢复到最初的草莓绒绒，你收藏过的小可爱都会保留。也可以用撤销找回这一步。</p><div class="modal-buttons"><button class="button secondary" data-action="close-modal">继续打扮</button><button class="button primary" data-action="confirm-reset">重新开始</button></div>');}
  else if(action==='confirm-reset'){setState(DEFAULT);avatar?.resetCamera();closeModal();toast('又是充满灵感的一天，开始吧！');}
  else if(action==='reset-camera'){avatar?.resetCamera();toast('转回来啦，你好呀！');}
  else if(action==='studio'){closeModal();window.scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});}
  else if(action==='reload')location.reload();
});
$('#controls-panel').addEventListener('input',event=>{
  const key=event.target.dataset.slider;if(!key)return;
  state={...state,[key]:Number(event.target.value)};event.target.style.setProperty('--fill',`${state[key]}%`);$(`#${key}-value`).textContent=state[key];updateAvatar();
});
$('#controls-panel').addEventListener('change',event=>{if(event.target.dataset.slider)commit();});
$('#avatar-name').addEventListener('change',event=>{state=normalizeState({...state,name:event.target.value});event.target.value=state.name;if(avatar)avatar.state=state;commit();});
$('#avatar-name').addEventListener('keydown',event=>{if(event.key==='Enter')event.target.blur();});
$('#category-tabs').addEventListener('keydown',event=>{
  if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
  event.preventDefault();let index=categories.findIndex(([id])=>id===category);index=event.key==='Home'?0:event.key==='End'?categories.length-1:(index+(event.key==='ArrowRight'?1:-1)+categories.length)%categories.length;chooseCategory(categories[index][0]);$(`#tab-${category}`).focus();
});
$('#modal').addEventListener('click',event=>{if(event.target===$('#modal')){const bounds=$('#modal').getBoundingClientRect();if(event.clientX<bounds.left||event.clientX>bounds.right||event.clientY<bounds.top||event.clientY>bounds.bottom)closeModal();}});
document.addEventListener('visibilitychange',()=>{if(!audioContext||!musicOn)return;if(document.hidden)audioContext.suspend().catch(()=>{});else audioContext.resume().catch(()=>{});});
window.addEventListener('pagehide',()=>{storeCurrent();});
fillIcons();renderTabs();renderPanel();renderPresets();updateCount();$('#avatar-name').value=state.name;
try{
  avatar=new AvatarScene($('#avatar-canvas'));avatar.update(state);$('#loading').hidden=true;$('#loading').style.display='none';
  $('#avatar-canvas').addEventListener('webglcontextlost',event=>{event.preventDefault();$('#loading').style.display='flex';$('#loading').classList.add('error-message');$('#loading').innerHTML='小可爱暂时休息了，重新加载就能回来。<button class="button primary" data-action="reload">重新唤醒</button>';});
}catch(error){
  console.error('3D scene initialization failed:',error);$('#loading').classList.add('error-message');$('#loading').innerHTML='当前浏览器还没有唤醒 3D 能力。<br>请使用新版 Edge 或 Chrome，并开启硬件加速。<button class="button primary" data-action="reload">再试一次</button>';document.querySelectorAll('[data-action="save"],[data-action="photo"],[data-view]').forEach(button=>button.disabled=true);
}
