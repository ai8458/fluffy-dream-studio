import { DEFAULT, OPTIONS, PALETTES, PRESETS, REWARDS, OUTFIT_GROUPS, isUnlocked, normalizeState, randomState, History } from './state.js?v=2.0.0';
import { THEMES,evaluateTheme,normalizeProgress,completedCount,starCount,designerTitle,submitLook } from './journey.js?v=2.0.0';
import { icon, fillIcons, miniAvatar, optionIllustration } from './icons.js?v=2.0.0';
import { AvatarScene, BACKGROUNDS } from './avatar.js?v=2.0.0';

const $=selector=>document.querySelector(selector);
const escapeHtml=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const CURRENT_KEY='fluffy-dream-current-v1',GALLERY_KEY='fluffy-dream-gallery-v1';
const PROGRESS_KEY='fluffy-dream-progress-v2';
function readStorage(key,fallback){try{return JSON.parse(localStorage.getItem(key))??fallback;}catch{return fallback;}}
let state=normalizeState(readStorage(CURRENT_KEY,DEFAULT)),category='face',avatar,toastTimer,updateFrame;
let progress=normalizeProgress(readStorage(PROGRESS_KEY,null)),accessorySlot='accessory',wardrobeSlot='outfit',outfitFilter='all',journeyTab='invitations';
let gallery=readStorage(GALLERY_KEY,[]);
if(!Array.isArray(gallery))gallery=[];
gallery=gallery.filter(item=>item&&typeof item.id==='string'&&typeof item.image==='string'&&item.image.startsWith('data:image/png;base64,')).slice(0,12).map(item=>({...item,state:normalizeState(item.state)}));
const history=new History(state);
const categories=[['face','脸型'],['hair','发型'],['eyes','五官'],['outfit','服饰'],['paint','彩绘'],['accessory','配饰'],['stage','布景']];
const accessorySlots=[['accessory','头饰'],['eyewear','眼镜'],['earrings','耳饰'],['necklace','颈饰'],['handheld','手持物'],['wings','翅膀']];
const KEY_CATEGORY={face:'face',faceWidth:'face',hair:'hair',hairColor:'hair',eyes:'eyes',mouth:'eyes',brows:'eyes',outfit:'outfit',dressColor:'outfit',pattern:'outfit',shoes:'outfit',paint:'paint',paintColor:'paint',accessory:'accessory',eyewear:'accessory',earrings:'accessory',necklace:'accessory',handheld:'accessory',wings:'accessory',background:'stage',pose:'stage',effect:'stage',frame:'stage'};
let storageNoticeShown=false;
function toast(message){clearTimeout(toastTimer);$('#toast').textContent=message;$('#toast').classList.add('visible');toastTimer=setTimeout(()=>$('#toast').classList.remove('visible'),3200);}
function storeCurrent(){try{localStorage.setItem(CURRENT_KEY,JSON.stringify(state));}catch{if(!storageNoticeShown){toast('浏览器暂时无法保存，记得拍照留下这份可爱。');storageNoticeShown=true;}}}
function commit(){history.push(state);storeCurrent();updateHistory();renderJourneyStatus();}
function updateHistory(){$('[data-action="undo"]').disabled=!history.canUndo;$('[data-action="redo"]').disabled=!history.canRedo;}
function updateAvatar(){cancelAnimationFrame(updateFrame);updateFrame=requestAnimationFrame(()=>{if(avatar)avatar.update(state);});}
function setState(value,{record=true}={}){state=normalizeState(value);$('#avatar-name').value=state.name;updateAvatar();renderPanel();if(record)commit();else{storeCurrent();updateHistory();renderJourneyStatus();}}
function section(title,body,subtitle='',value=''){return `<section class="control-section"><div class="section-title"><h3>${title}${subtitle?`<em>${subtitle}</em>`:''}</h3>${value?`<span class="section-value">${value}</span>`:''}</div>${body}</section>`;}
function choices(key,extra=''){
  const count=completedCount(progress),theme=THEMES.find(t=>t.id===progress.active),goal=progress.playing?theme.rules.find(rule=>rule.key===key):null;
  const list=key==='outfit'&&outfitFilter!=='all'?OPTIONS[key].filter(([id])=>OUTFIT_GROUPS[outfitFilter].includes(id)):OPTIONS[key];
  return `<div class="choice-grid ${extra}" role="group" aria-label="选择${key}">${list.map(([id,label])=>{
    const locked=!isUnlocked(key,id,count),reward=REWARDS.find(r=>r.key===key&&r.value===id),recommended=goal?.values.includes(id);
    return `<button class="choice-tile ${state[key]===id?'active':''} ${locked?'locked':''} ${recommended?'recommended':''}" data-choice="${key}" data-value="${id}" aria-pressed="${state[key]===id}" aria-disabled="${locked}" aria-label="${label}${locked?`，需要 ${reward.need} 枚印章`:''}">${optionIllustration(key,id,state)}<span>${label}</span>${locked?`<small class="lock-label">♢ ${reward.need} 枚印章</small>`:recommended?'<small class="recommend-label">符合邀请</small>':''}</button>`;
  }).join('')}</div>`;
}
function swatches(key){return `<div class="swatch-list" role="group" aria-label="${({skin:'肤色',hairColor:'发色',dressColor:'服饰颜色',eyeColor:'瞳色',accentColor:'装饰配色',paintColor:'彩绘颜色'})[key]}">${PALETTES[key].map(([color,label],index)=>`<button class="swatch ${state[key]===color?'active':''}" style="--swatch:${color};--check:${(key==='skin'&&index<3)||(key==='dressColor'&&index>3)?'#a57563':'#fff'}" data-choice="${key}" data-value="${color}" aria-label="${label}" aria-pressed="${state[key]===color}" title="${label}"></button>`).join('')}</div>`;}
function slider(key,label,left,right){return `<div class="slider-row"><label class="slider-label" for="${key}">${label}<output for="${key}" id="${key}-value">${state[key]}</output></label><input type="range" min="0" max="100" value="${state[key]}" id="${key}" data-slider="${key}" style="--fill:${state[key]}%"><div class="range-endpoints"><span>${left}</span><span>${right}</span></div></div>`;}
function tip(text){return `<div class="tip-box">${icon('sparkles')}<span>${text}</span></div>`;}
function colorName(key){return PALETTES[key].find(([c])=>c===state[key])?.[1]||'';}
function renderTabs(){
  $('#category-tabs').innerHTML=categories.map(([id,label],index)=>`<button id="tab-${id}" class="category-tab ${category===id?'active':''}" role="tab" aria-selected="${category===id}" aria-controls="controls-panel" tabindex="${category===id?0:-1}" data-category="${id}">${icon(id)}<span>${label}</span></button>`).join('');
  $('#controls-panel').setAttribute('aria-labelledby',`tab-${category}`);$('#step-badge').textContent=`0${categories.findIndex(([id])=>id===category)+1} / 07`;
}
function slots(list,selected,type){return `<div class="slot-list" role="group" aria-label="${type==='wardrobe'?'服饰分类':'配饰部位'}">${list.map(([id,label])=>`<button class="${id===selected?'active':''}" data-${type}-slot="${id}" aria-pressed="${id===selected}">${label}</button>`).join('')}</div>`;}
function renderPanel(){
  let html='';
  if(category==='face')html=section('选一个小脸蛋',choices('face'),'9 种可爱')+section('肤色',swatches('skin'),'',colorName('skin'))+'<hr class="control-rule">'+section('再捏一捏',slider('faceWidth','脸蛋宽度','窄一点','圆一点')+slider('cheek','脸颊饱满度','软软的','糯糯的')+slider('chin','下巴弧度','圆润','精巧')+slider('noseSize','小鼻子大小','小巧','圆圆的'))+tip('每一种脸蛋都可爱。试试「彩绘」里的雀斑、星星和小蝴蝶吧。');
  if(category==='hair')html=section('今天梳什么发型',choices('hair'),'10 款发型')+section('染一抹喜欢的颜色',swatches('hairColor'),'',colorName('hairColor'))+tip('卷卷发、姬式长发、双马尾和侧边麻花都来啦。左右拖动娃娃，看看背面的细节。');
  if(category==='eyes')html=section('眼睛里藏着小星星',choices('eyes'))+section('瞳色',swatches('eyeColor'),'',colorName('eyeColor'))+section('一点点小调整',slider('eyeSize','眼睛大小','小巧','闪亮')+slider('eyeSpace','眼睛间距','靠近','散开'))+section('眉毛也有小表情',choices('brows'))+section('一个甜甜的表情',choices('mouth'));
  if(category==='outfit'){
    html=slots([['outfit','衣服 · 18'],['pattern','图案 · 7'],['shoes','鞋子 · 5']],wardrobeSlot,'wardrobe');
    if(wardrobeSlot==='outfit')html+=`<div class="outfit-filters">${[['all','全部'],['daily','日常甜心'],['adventure','冒险出发'],['fantasy','童话衣橱']].map(([id,label])=>`<button data-outfit-filter="${id}" class="${outfitFilter===id?'active':''}" aria-pressed="${outfitFilter===id}">${label}</button>`).join('')}</div>`;
    html+=section(wardrobeSlot==='outfit'?'穿上今天的好心情':wardrobeSlot==='pattern'?'亲手设计一块小布料':'从鞋尖开始的可爱',choices(wardrobeSlot))+section('主色',swatches('dressColor'),'',colorName('dressColor'))+section('图案与装饰配色',swatches('accentColor'),'',colorName('accentColor'))+tip('衣服、布料图案和鞋子可以自由组合。带印章标记的特别服装，完成「灵感旅行」后就能解锁。');
  }
  if(category==='paint')html=section('在脸颊画一个小梦',choices('paint'),'8 款装饰')+section('彩绘颜色',swatches('paintColor'),'',colorName('paintColor'))+section('轻轻调一调',slider('paintOpacity','彩绘浓度','若隐若现','清晰可爱')+slider('blush','腮红浓度','淡淡的','粉扑扑'))+tip('彩绘会贴着脸蛋一起转动。用猫咪胡须搭配猫耳，或把雀斑、圆眼镜和草帽搭在一起。');
  if(category==='accessory'){
    html=slots(accessorySlots,accessorySlot,'accessory')+section(`挑一件${accessorySlots.find(([id])=>id===accessorySlot)[1]}`,choices(accessorySlot,'accessory-grid'))+section('装饰配色',swatches('accentColor'),'',colorName('accentColor'));
    const wearing=accessorySlots.filter(([key])=>state[key]!=='none');
    html+=section('现在佩戴的装饰',`<div class="wearing-list">${wearing.length?wearing.map(([key,label])=>`<button data-remove-slot="${key}" aria-label="取下${OPTIONS[key].find(([id])=>id===state[key])?.[1]}">${label} · ${OPTIONS[key].find(([id])=>id===state[key])?.[1]} <span>×</span></button>`).join(''):'<span class="color-note">轻装出发，也很可爱。</span>'}</div>`)+tip('六个部位可以同时佩戴！头饰、眼镜、耳夹、项链、手持物和翅膀，各有自己的位置。');
  }
  if(category==='stage')html=section('换一个梦境背景',`<div class="background-list">${OPTIONS.background.map(([id,label])=>`<button class="background-chip ${state.background===id?'active':''}" style="--scene:${BACKGROUNDS[id].bottom}" data-choice="background" data-value="${id}" aria-pressed="${state.background===id}" aria-disabled="${!isUnlocked('background',id,completedCount(progress))}"><span></span>${label}${isUnlocked('background',id,completedCount(progress))?'':' ♢'}</button>`).join('')}</div>`)+section('摆一个小姿势',choices('pose'))+section('让梦境动起来',choices('effect'))+section('照片里的小心意',choices('frame'))+tip('相框会出现在下载的照片中。舞台上的泡泡、花瓣和星光，也会一起留进纪念照。');
  $('#controls-panel').innerHTML=html;
}
function chooseCategory(next){category=next;renderTabs();renderPanel();$('#controls-panel').scrollTop=0;}
function renderPresets(){$('#preset-list').innerHTML=PRESETS.map((preset,index)=>`<button class="preset-card" data-preset="${index}" aria-label="穿上${preset.name}"><span class="preset-image" style="--preset-bg:${preset.bg}">${miniAvatar(preset.state)}</span><span><strong>${preset.name}</strong><small>${preset.sub}</small></span><span class="preset-arrow">↗</span></button>`).join('');}
function showModal(html,{wide=false}={}){$('#modal').classList.toggle('wide-modal',wide);$('#modal-content').innerHTML=html;if(!$('#modal').open)$('#modal').showModal();}
function closeModal(){$('#modal').close();}
function updateCount(){$('#collection-count').textContent=gallery.length;}
function storeProgress(){try{localStorage.setItem(PROGRESS_KEY,JSON.stringify(progress));return true;}catch{toast('浏览器空间不足，旅行进度暂时未能保存。可以先拍照留念。');return false;}}
function renderJourneyStatus(){
  const count=completedCount(progress),stars=starCount(progress),theme=THEMES.find(t=>t.id===progress.active);
  $('#journey-card').innerHTML=`<span class="journey-emblem">${count>=12?'♔':'✦'}</span><div><small>灵感旅行 · ${designerTitle(progress)}</small><strong>${count?`已收集 ${count} / 12 枚旅行印章`:'12 封邀请，等你打开新的小世界'}</strong><span class="journey-meter"><i style="width:${count/12*100}%"></i></span></div><button class="button" data-action="journey">${progress.playing?'查看旅行':'开启旅行'} ${icon('map')}</button>`;
  const brief=$('#theme-brief');brief.hidden=!progress.playing;
  if(progress.playing){
    const result=evaluateTheme(theme.id,state);
    brief.innerHTML=`<div class="brief-heading"><button data-action="journey"><span>${theme.symbol}</span> ${theme.title}</button><span class="brief-score">${result.score} / 4</span><button data-action="free-mode" class="brief-close" aria-label="返回自由创作" title="返回自由创作">×</button></div><div class="brief-rules">${result.rules.map((rule,i)=>`<button class="${rule.met?'met':''}" data-rule-index="${i}"><span>${rule.met?'✓':'○'}</span>${rule.label}</button>`).join('')}</div><button class="button primary submit-look" data-action="submit-look">${result.score===4?'收下这枚旅行印章 ✦':'检查这套搭配'} <span>${result.score===4?'已集齐四个灵感':'点击提示可找到对应衣橱'}</span></button>`;
  }
  $('.journey-nav').title=`已收集 ${count} 枚印章，${stars} 颗灵感星`;
}
function goToKey(key){
  const next=KEY_CATEGORY[key]||'outfit';
  if(next==='accessory')accessorySlot=accessorySlots.some(([id])=>id===key)?key:'accessory';
  if(next==='outfit'){wardrobeSlot=['pattern','shoes'].includes(key)?key:'outfit';outfitFilter='all';}
  chooseCategory(next);
  const target=$(`[data-choice="${key}"]`);if(target){const scroll=$('#controls-panel');scroll.scrollTop=Math.max(0,target.offsetTop-scroll.offsetTop-60);}
}
function selectTheme(id){
  if(!THEMES.some(t=>t.id===id))return;
  progress={...progress,active:id,playing:true};storeProgress();closeModal();renderJourneyStatus();goToKey(THEMES.find(t=>t.id===id).rules[0].key);toast('邀请已展开，四个小提示会陪你一起搭配。');
  if(matchMedia('(max-width:740px)').matches)$('.customizer').scrollIntoView({block:'start',behavior:'smooth'});
}
function renderJourney(tab=journeyTab){
  journeyTab=tab;const count=completedCount(progress),stars=starCount(progress);
  let content='';
  if(tab==='invitations')content=`<div class="theme-grid">${THEMES.map((theme,i)=>{const best=progress.best[theme.id]||0;return `<button class="theme-card ${best===4?'completed':''}" data-theme="${theme.id}" style="--theme:${theme.color}"><span class="theme-symbol">${theme.symbol}</span><span class="theme-number">${String(i+1).padStart(2,'0')}</span><strong>${theme.title}</strong><small>${theme.subtitle}</small><span class="theme-card-bottom"><span class="theme-stars" aria-label="${best} 颗灵感星">${'✦'.repeat(best)}<i>${'✧'.repeat(4-best)}</i></span><span>${best===4?'已盖章 ✓':'打开邀请 ↗'}</span></span></button>`;}).join('')}</div><p class="journey-note">每封邀请有四个搭配提示，没有时间限制。点提示可跳到对应衣橱；四项都完成，就能留下一张旅行照片和一枚印章。</p>`;
  if(tab==='rewards')content=`<div class="reward-grid">${REWARDS.map(reward=>{const unlocked=count>=reward.need;return `<article class="reward-card ${unlocked?'unlocked':''}"><div>${optionIllustration(reward.key,reward.value,state)}</div><strong>${reward.title}</strong><small>${unlocked?'已经属于你啦':`集齐 ${reward.need} 枚印章解锁`}</small>${unlocked?`<button class="button" data-equip-key="${reward.key}" data-equip-value="${reward.value}">现在穿戴</button>`:`<span class="reward-progress">${count} / ${reward.need} 枚印章</span>`}</article>`;}).join('')}</div><p class="journey-note">印章来自不同的邀请。同一主题可以反复打扮和更新照片，奖励只领取一次。</p>`;
  if(tab==='album')content=`<div class="album-grid">${THEMES.map(theme=>{const entry=progress.album[theme.id];return entry?`<article class="album-card"><img src="${escapeHtml(entry.image)}" alt="${escapeHtml(entry.state.name)} · ${theme.title}"><span class="album-stamp">${theme.symbol}</span><strong>${theme.title}</strong><small>${escapeHtml(entry.state.name)}</small><button data-album-load="${theme.id}">重访这个造型 ↗</button></article>`:`<article class="album-card empty"><span>${theme.symbol}</span><strong>${theme.title}</strong><small>完成邀请，留下旅行照片</small><button data-theme="${theme.id}">去这一站 ↗</button></article>`;}).join('')}</div>`;
  showModal(`<div class="journey-modal-heading"><span class="eyebrow">THE LITTLE STYLE JOURNEY</span><h2 class="modal-title">让可爱，去更远的地方 <span>✦</span></h2><p class="modal-subtitle">${designerTitle(progress)}，你已收集 <b>${count} / 12</b> 枚印章，点亮 <b>${stars} / 48</b> 颗灵感星。</p></div><div class="journey-tabs" role="group" aria-label="旅行手册分类">${[['invitations','主题邀请'],['rewards','惊喜奖励'],['album','旅行手账']].map(([id,label])=>`<button data-journey-tab="${id}" class="${tab===id?'active':''}" aria-pressed="${tab===id}">${label}</button>`).join('')}</div>${content}`,{wide:true});
}
function submitCurrentLook(){
  if(!avatar||!progress.playing)return;
  avatar.update(state);const theme=THEMES.find(t=>t.id===progress.active),evaluation=evaluateTheme(theme.id,state);
  const image=evaluation.score===4?avatar.snapshot({size:260,card:false}):'';
  const result=submitLook(progress,theme.id,state,image),previous=progress;progress=result.progress;
  if(!storeProgress()){progress=previous;return;}
  renderJourneyStatus();renderPanel();
  const next=THEMES.find(t=>progress.best[t.id]!==4);
  showModal(`<div class="result-card"><span class="result-symbol">${evaluation.score===4?theme.symbol:'✧'}</span><span class="eyebrow">${evaluation.score===4?'A LITTLE DREAM, COMPLETED':'EVERY IDEA COUNTS'}</span><h2 class="modal-title">${evaluation.score===4?result.newStamp?'新的一站，盖章成功！':'这次的可爱，也收进手账啦':'已经找到一些小灵感啦'}</h2><p class="modal-subtitle">${theme.title} · ${evaluation.score} / 4 个搭配灵感<br>${evaluation.score===4?'旅行照片已保存，可以在「旅行手账」重访。':'还差一点点，照着未完成的提示再试试吧。'}</p>${image?`<img class="result-photo" src="${image}" alt="本次完成的主题造型">`:`<div class="result-rules">${evaluation.rules.map(rule=>`<p class="${rule.met?'met':''}">${rule.met?'✓':'○'} ${rule.label}</p>`).join('')}</div>`}${result.rewards.length?`<div class="new-rewards"><strong>叮！解锁了新的小礼物</strong>${result.rewards.map(reward=>`<span>${reward.symbol} ${reward.title}</span>`).join('')}</div>`:''}<div class="modal-buttons"><button class="button secondary" data-action="close-modal">${evaluation.score===4?'继续打扮':'再试一试'}</button>${evaluation.score===4?`<button class="button primary" ${next?`data-theme="${next.id}"`:'data-journey-tab="rewards"'}>${next?'去下一站 →':'打开惊喜奖励'}</button>`:''}</div></div>`);
  if(evaluation.score===4){avatar.bounce=1;celebrate();}
}
function celebrate(){
  if(matchMedia('(prefers-reduced-motion:reduce)').matches)return;
  const shower=document.createElement('div');shower.className='celebration';shower.setAttribute('aria-hidden','true');shower.innerHTML=Array.from({length:22},(_,i)=>`<i style="--x:${(i*47)%100}%;--delay:${i*.03}s;--color:${['#e2a1bc','#a6b9cf','#d9c284','#b7c8a0'][i%4]}">${i%3?'✦':'♡'}</i>`).join('');document.body.append(shower);setTimeout(()=>shower.remove(),2300);
}
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
function showHelp(){showModal(`<span class="eyebrow">A TINY GUIDE TO HAPPINESS</span><h2 class="modal-title">欢迎来到绒绒造梦屋 2.0 ✦</h2><p class="modal-subtitle">可以自由创作，也可以带着你的娃娃，开始一趟灵感旅行。</p><div class="help-list">${[['创造自己的小可爱','9 种脸型、10 种发型、6 种眼睛和表情。彩绘抽屉里还有雀斑、星星、樱花、彩虹与猫咪胡须。'],['把衣橱搭出新花样','18 套服装搭配 7 种布料图案和 5 款鞋子。六个配饰部位可以叠戴，试试草帽、眼镜、耳夹、小熊和翅膀的组合。'],['打开十二封主题邀请','从「灵感旅行」选一站，按照四个提示完成穿搭。点击提示会打开对应衣橱，满足的选项有绿色标记。没有倒计时，也不会评价脸型或肤色。'],['集印章，解锁小礼物','完成不同邀请可解锁爱心眼镜、蝴蝶翅膀、星河礼服、独角兽角、彩虹庆典和极光背景。重复挑战会更新旅行照片，不重复发放印章。'],['布置舞台，留下纪念','在「布景」选择姿势、花瓣、泡泡和相框。相框会印在下载的照片里；收藏夹和旅行手账分别保存你的自由作品和主题作品。']].map(([title,body],i)=>`<div class="help-item"><span class="help-number">0${i+1}</span><div><strong>${title}</strong><p>${body}</p></div></div>`).join('')}</div><p class="keyboard-hint">Tab 选择控件，方向键调整滑杆；选中舞台后，← → 旋转，Home 回到正面。<br><br>旧造型和收藏会保留。新进度同样保存在当前浏览器，清除网站数据会清空收藏和旅行手账，请拍照备份。</p>`);}

document.addEventListener('click',event=>{
  const button=event.target.closest('button');if(!button||button.disabled)return;
  if(button.dataset.journeyTab){renderJourney(button.dataset.journeyTab);return;}
  if(button.dataset.theme){selectTheme(button.dataset.theme);return;}
  if(button.dataset.ruleIndex!==undefined){goToKey(THEMES.find(t=>t.id===progress.active).rules[Number(button.dataset.ruleIndex)].key);return;}
  if(button.dataset.accessorySlot){accessorySlot=button.dataset.accessorySlot;renderPanel();$('#controls-panel').scrollTop=0;return;}
  if(button.dataset.wardrobeSlot){wardrobeSlot=button.dataset.wardrobeSlot;renderPanel();$('#controls-panel').scrollTop=0;return;}
  if(button.dataset.outfitFilter){outfitFilter=button.dataset.outfitFilter;renderPanel();return;}
  if(button.dataset.removeSlot){setState({...state,[button.dataset.removeSlot]:'none'});return;}
  if(button.dataset.albumLoad){const entry=progress.album[button.dataset.albumLoad];if(entry){setState(entry.state);closeModal();toast('欢迎重访这个小小梦境。');}return;}
  if(button.dataset.equipKey){const key=button.dataset.equipKey,value=button.dataset.equipValue;if(isUnlocked(key,value,completedCount(progress))){setState({...state,[key]:value});closeModal();goToKey(key);toast('新礼物已经穿戴好啦！');}return;}
  if(button.dataset.category){chooseCategory(button.dataset.category);$(`#tab-${category}`).focus({preventScroll:true});return;}
  if(button.dataset.choice){const key=button.dataset.choice,value=button.dataset.value;if(!isUnlocked(key,value,completedCount(progress))){const reward=REWARDS.find(r=>r.key===key&&r.value===value);toast(`完成 ${reward.need} 个不同主题邀请，就能解锁「${reward.title}」。`);return;}state={...state,[key]:value};updateAvatar();commit();renderPanel();$(`[data-choice="${key}"][data-value="${value}"]`)?.focus({preventScroll:true});return;}
  if(button.dataset.preset!==undefined){setState(PRESETS[Number(button.dataset.preset)].state);if(avatar)avatar.bounce=1;toast(`已换上「${PRESETS[Number(button.dataset.preset)].name}」`);return;}
  if(button.dataset.view){avatar?.setView(button.dataset.view);document.querySelectorAll('[data-view]').forEach(el=>{el.classList.toggle('active',el===button);el.setAttribute('aria-pressed',String(el===button));});return;}
  if(button.dataset.load){const item=gallery.find(item=>item.id===button.dataset.load);if(item){setState(item.state);closeModal();toast(`欢迎回来，${item.state.name}！`);}return;}
  if(button.dataset.delete){const item=gallery.find(item=>item.id===button.dataset.delete);if(item)showModal(`<span class="eyebrow">MAKE A LITTLE ROOM</span><h2 class="modal-title">移除这份收藏？</h2><p class="modal-subtitle">「${escapeHtml(item.state.name)}」将离开收藏夹。当前正在编辑的娃娃不受影响。</p><div class="modal-buttons"><button class="button secondary" data-action="gallery">再想一想</button><button class="button primary" data-confirm-delete="${escapeHtml(item.id)}">移除收藏</button></div>`);return;}
  if(button.dataset.confirmDelete){const next=gallery.filter(item=>item.id!==button.dataset.confirmDelete);try{localStorage.setItem(GALLERY_KEY,JSON.stringify(next));gallery=next;updateCount();renderGallery();toast('已腾出一个小位置。');}catch{toast('暂时无法移除收藏，请稍后再试。');}return;}
  const action=button.dataset.action;
  if(action==='save')saveAvatar();
  else if(action==='journey')renderJourney();
  else if(action==='submit-look')submitCurrentLook();
  else if(action==='free-mode'){progress={...progress,playing:false};storeProgress();renderJourneyStatus();renderPanel();toast('回到自由创作，旅行进度已经保留。');}
  else if(action==='gallery')renderGallery();
  else if(action==='help')showHelp();
  else if(action==='sound')toggleMusic();
  else if(action==='close-modal')closeModal();
  else if(action==='photo')photo();
  else if(action==='random'){setState(randomState(Math.random,completedCount(progress)));if(avatar){avatar.bounce=1;avatar.resetCamera();}toast('✦ 叮！一只意想不到的小可爱出现了。');}
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
fillIcons();renderTabs();renderPanel();renderPresets();updateCount();renderJourneyStatus();$('#avatar-name').value=state.name;
try{
  avatar=new AvatarScene($('#avatar-canvas'));avatar.update(state);$('#loading').hidden=true;$('#loading').style.display='none';
  $('#avatar-canvas').addEventListener('webglcontextlost',event=>{event.preventDefault();$('#loading').style.display='flex';$('#loading').classList.add('error-message');$('#loading').innerHTML='小可爱暂时休息了，重新加载就能回来。<button class="button primary" data-action="reload">重新唤醒</button>';});
}catch(error){
  console.error('3D scene initialization failed:',error);$('#loading').classList.add('error-message');$('#loading').innerHTML='当前浏览器还没有唤醒 3D 能力。<br>请使用新版 Edge 或 Chrome，并开启硬件加速。<button class="button primary" data-action="reload">再试一次</button>';document.querySelectorAll('[data-action="save"],[data-action="photo"],[data-view]').forEach(button=>button.disabled=true);
}
