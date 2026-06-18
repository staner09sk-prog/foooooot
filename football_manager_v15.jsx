import { useState, useMemo, useEffect, useRef } from "react";
import { ALL_PLAYERS, KLEAGUE_PLAYERS, POS_POOL, nerfKoreanPlayer, applyPlayerDefaults, isKoreanNat, KOREAN_NATS, KOREAN_SUPERSTAR_IDS } from "./playerData.js";

// ── 디자인 토큰 ──────────────────────────────────────────────────────────────
const C = {
  primary:   "#1d4ed8",
  primaryLt: "#eff6ff",
  primaryBd: "#bfdbfe",
  success:   "#15803d",
  successLt: "#f0fdf4",
  danger:    "#dc2626",
  dangerLt:  "#fff1f2",
  warn:      "#d97706",
  warnLt:    "#fffbeb",
  bg:        "#f1f5f9",
  surface:   "#ffffff",
  border:    "#e2e8f0",
  borderMd:  "#cbd5e1",
  text:      "#0f172a",
  textMd:    "#475569",
  textSm:    "#94a3b8",
  hdrBg:     "#0f172a",
  hdrText:   "#f8fafc",
};

const MODAL_OVERLAY={position:"fixed",inset:0,background:"rgba(0,0,0,0.72)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:300,padding:16,backdropFilter:"blur(2px)"};
const MODAL_BOX={background:C.surface,borderRadius:16,padding:"1.5rem",width:"100%",maxHeight:"90vh",overflowY:"auto",boxShadow:"0 20px 60px rgba(0,0,0,0.28)",color:C.text,border:`1px solid ${C.border}`};
const BTN_PRIMARY={borderRadius:8,border:"none",background:C.primary,color:"#fff",cursor:"pointer",fontFamily:"inherit",fontWeight:700,letterSpacing:"-0.2px"};
const BTN_DANGER={borderRadius:8,border:"1.5px solid #fca5a5",background:C.dangerLt,color:C.danger,cursor:"pointer",fontFamily:"inherit",fontWeight:600};
const BTN_CANCEL={borderRadius:8,border:`1.5px solid ${C.borderMd}`,background:C.bg,color:C.textMd,cursor:"pointer",fontFamily:"inherit",fontWeight:500};
const BTN_WHITE={borderRadius:8,border:`1.5px solid ${C.border}`,background:C.surface,cursor:"pointer",fontFamily:"inherit",color:C.text,fontWeight:500};
const BTN_SUCCESS={borderRadius:8,border:"none",background:C.success,color:"#fff",cursor:"pointer",fontFamily:"inherit",fontWeight:700};
const CARD={background:C.bg,border:`1px solid ${C.border}`,borderRadius:10,padding:"8px 10px"};
const INPUT_S={width:"100%",padding:"9px 12px",borderRadius:9,border:`1.5px solid ${C.border}`,fontSize:13,background:C.surface,color:C.text,fontFamily:"inherit",boxSizing:"border-box",outline:"none"};
// ─────────────────────────────────────────────────────────────────────────────

// ─── 클럽 로고: 인라인 SVG (CORS 없음, 항상 로드됨) ───
const CLUB_COLORS = {
  // 프리미어리그
  arsenal:     {bg:"#EF0107",fg:"#FFFFFF",text:"AFC",ring:"#9C0000"},
  man_city:    {bg:"#6CABDD",fg:"#FFFFFF",text:"MCI",ring:"#1C2C5B"},
  man_utd:     {bg:"#DA020E",fg:"#FBE122",text:"MU",ring:"#000000"},
  liverpool:   {bg:"#C8102E",fg:"#F6EB61",text:"LFC",ring:"#00B2A9"},
  chelsea:     {bg:"#034694",fg:"#FFFFFF",text:"CFC",ring:"#DBA111"},
  tottenham:   {bg:"#132257",fg:"#FFFFFF",text:"THFC",ring:"#FFFFFF"},
  aston_villa: {bg:"#95BFE5",fg:"#670E36",text:"AVFC",ring:"#670E36"},
  newcastle:   {bg:"#241F20",fg:"#FFFFFF",text:"NUFC",ring:"#FFFFFF"},
  brighton:    {bg:"#0057B8",fg:"#FFFFFF",text:"BHAFC",ring:"#FFCD00"},
  bournemouth: {bg:"#DA291C",fg:"#000000",text:"AFCB",ring:"#000000"},
  everton:     {bg:"#003399",fg:"#FFFFFF",text:"EFC",ring:"#FFFFFF"},
  fulham:      {bg:"#CC0000",fg:"#FFFFFF",text:"FFC",ring:"#000000"},
  crystal_palace:{bg:"#1B458F",fg:"#C4122E",text:"CPFC",ring:"#A7A5A6"},
  brentford:   {bg:"#E30613",fg:"#FFFFFF",text:"BFC",ring:"#000000"},
  nottm_forest:{bg:"#DD0000",fg:"#FFFFFF",text:"NFFC",ring:"#FFFFFF"},
  sunderland:  {bg:"#EB172B",fg:"#FFFFFF",text:"SAFC",ring:"#000000"},
  leicester:   {bg:"#003090",fg:"#FDBE11",text:"LCFC",ring:"#FDBE11"},
  wolves:      {bg:"#FDB913",fg:"#231F20",text:"WFC",ring:"#231F20"},
  leeds:       {bg:"#FFCD00",fg:"#1D428A",text:"LUFC",ring:"#1D428A"},
  ipswich:     {bg:"#0044A9",fg:"#FFFFFF",text:"ITFC",ring:"#FFFFFF"},
  // 라리가
  real_madrid: {bg:"#FEBE10",fg:"#FFFFFF",text:"RM",ring:"#00529F"},
  barcelona:   {bg:"#A50044",fg:"#004D98",text:"FCB",ring:"#EDBB00"},
  atletico:    {bg:"#CB3524",fg:"#FFFFFF",text:"ATM",ring:"#272E61"},
  sevilla:     {bg:"#D71920",fg:"#FFFFFF",text:"SFC",ring:"#000000"},
  real_betis:  {bg:"#00954C",fg:"#FFFFFF",text:"RBB",ring:"#FFFFFF"},
  real_sociedad:{bg:"#004F9F",fg:"#FFFFFF",text:"RSO",ring:"#FFFFFF"},
  athletic_bilbao:{bg:"#EE2523",fg:"#FFFFFF",text:"ATH",ring:"#FFFFFF"},
  villarreal:  {bg:"#F7D500",fg:"#004F9F",text:"VCF",ring:"#004F9F"},
  valencia:    {bg:"#F77F00",fg:"#000000",text:"VCF",ring:"#000000"},
  real_sociedad2:{bg:"#6CB4E4",fg:"#FFFFFF",text:"CVC",ring:"#FFFFFF"},
  girona:      {bg:"#9F1D35",fg:"#FFFFFF",text:"GFC",ring:"#FFFFFF"},
  osasuna:     {bg:"#C8152B",fg:"#FFFFFF",text:"CAO",ring:"#003399"},
  getafe:      {bg:"#006CB5",fg:"#FFFFFF",text:"GCF",ring:"#FFFFFF"},
  mallorca:    {bg:"#C8152B",fg:"#FFED00",text:"RCD",ring:"#000000"},
  espanyol:    {bg:"#0070B8",fg:"#FFFFFF",text:"RCE",ring:"#FFED00"},
  alaves:      {bg:"#003DA5",fg:"#FFFFFF",text:"DA",ring:"#FFFFFF"},
  rayo_vallecano:{bg:"#FFFFFF",fg:"#CC0000",text:"RV",ring:"#CC0000"},
  leganes:     {bg:"#2B59A0",fg:"#FFFFFF",text:"CDL",ring:"#FFFFFF"},
  las_palmas:  {bg:"#FFED00",fg:"#004A97",text:"UDLP",ring:"#004A97"},
  valladolid:  {bg:"#6A0DAD",fg:"#FFFFFF",text:"RVA",ring:"#FFFFFF"},
  // 세리에A
  inter:       {bg:"#010E80",fg:"#FFFFFF",text:"INTER",ring:"#000000"},
  ac_milan:    {bg:"#FB090B",fg:"#000000",text:"ACM",ring:"#000000"},
  juventus:    {bg:"#000000",fg:"#FFFFFF",text:"JUV",ring:"#FFFFFF"},
  napoli:      {bg:"#12A0C3",fg:"#FFFFFF",text:"SSC",ring:"#FFFFFF"},
  roma:        {bg:"#8B1A1A",fg:"#F5C518",text:"ASR",ring:"#F5C518"},
  lazio:       {bg:"#87CEEB",fg:"#FFFFFF",text:"SSL",ring:"#003B72"},
  atalanta:    {bg:"#1E4799",fg:"#000000",text:"ATA",ring:"#000000"},
  fiorentina:  {bg:"#4B0082",fg:"#FFFFFF",text:"ACF",ring:"#FFFFFF"},
  torino:      {bg:"#8B1A1A",fg:"#FFFFFF",text:"TOR",ring:"#FFFFFF"},
  bologna:     {bg:"#C8102E",fg:"#003DA5",text:"BFC",ring:"#003DA5"},
  udinese:     {bg:"#000000",fg:"#FFFFFF",text:"UDI",ring:"#FFFFFF"},
  empoli:      {bg:"#0055A4",fg:"#FFFFFF",text:"EMP",ring:"#FFFFFF"},
  cagliari:    {bg:"#C8102E",fg:"#003DA5",text:"CAG",ring:"#003DA5"},
  genoa:       {bg:"#C8102E",fg:"#003DA5",text:"GEN",ring:"#003DA5"},
  hellas_verona:{bg:"#FFD700",fg:"#003DA5",text:"HVE",ring:"#003DA5"},
  lecce:       {bg:"#CC0000",fg:"#FFED00",text:"USL",ring:"#000000"},
  parma:       {bg:"#FFED00",fg:"#003DA5",text:"PAR",ring:"#003DA5"},
  como:        {bg:"#003DA5",fg:"#FFFFFF",text:"COM",ring:"#FFFFFF"},
  venezia:     {bg:"#F77F00",fg:"#1B1464",text:"VFC",ring:"#1B1464"},
  monza:       {bg:"#E31837",fg:"#FFFFFF",text:"ACM",ring:"#FFFFFF"},
  // 분데스리가
  bayern:      {bg:"#DC052D",fg:"#FFFFFF",text:"FCB",ring:"#0066B2"},
  dortmund:    {bg:"#FDE100",fg:"#000000",text:"BVB",ring:"#000000"},
  leverkusen:  {bg:"#E32221",fg:"#000000",text:"B04",ring:"#000000"},
  rb_leipzig:  {bg:"#DD0741",fg:"#FFFFFF",text:"RBL",ring:"#00489D"},
  frankfurt:   {bg:"#E2001A",fg:"#000000",text:"SGE",ring:"#000000"},
  wolfsburg:   {bg:"#1D8348",fg:"#FFFFFF",text:"VfL",ring:"#FFFFFF"},
  stuttgart:   {bg:"#CC0000",fg:"#FFFFFF",text:"VfB",ring:"#FFFFFF"},
  gladbach:    {bg:"#000000",fg:"#FFFFFF",text:"BMG",ring:"#FFFFFF"},
  werder:      {bg:"#1D8348",fg:"#FFFFFF",text:"SVW",ring:"#FFFFFF"},
  union_berlin:{bg:"#CC0000",fg:"#FFFFFF",text:"FCU",ring:"#FFFFFF"},
  augsburg:    {bg:"#BA3030",fg:"#1D8348",text:"FCA",ring:"#1D8348"},
  freiburg:    {bg:"#CC0000",fg:"#000000",text:"SCF",ring:"#000000"},
  mainz:       {bg:"#C8102E",fg:"#FFFFFF",text:"M05",ring:"#FFFFFF"},
  hoffenheim:  {bg:"#1463AA",fg:"#FFFFFF",text:"TSG",ring:"#FFFFFF"},
  heidenheim:  {bg:"#CC0000",fg:"#FFFFFF",text:"FCH",ring:"#FFFFFF"},
  st_pauli:    {bg:"#5B3427",fg:"#FFFFFF",text:"FCSP",ring:"#FFFFFF"},
  bochum:      {bg:"#003DA5",fg:"#FFFFFF",text:"VfL",ring:"#FFFFFF"},
  holstein_kiel:{bg:"#003DA5",fg:"#CC0000",text:"KSV",ring:"#CC0000"},
  // 리그1
  psg:         {bg:"#004170",fg:"#DA291C",text:"PSG",ring:"#DA291C"},
  monaco:      {bg:"#DA291C",fg:"#FFFFFF",text:"ASM",ring:"#FFFFFF"},
  olympique_marseille:{bg:"#009AC7",fg:"#FFFFFF",text:"OM",ring:"#FFFFFF"},
  lyon:        {bg:"#CC0000",fg:"#003DA5",text:"OL",ring:"#003DA5"},
  lille:       {bg:"#CC0000",fg:"#003DA5",text:"LOSC",ring:"#003DA5"},
  rennes:      {bg:"#CC0000",fg:"#000000",text:"SRF",ring:"#000000"},
  nice:        {bg:"#CC0000",fg:"#000000",text:"OGCN",ring:"#000000"},
  lens:        {bg:"#CC0000",fg:"#FFED00",text:"RCL",ring:"#FFED00"},
  reims:       {bg:"#CC0000",fg:"#FFFFFF",text:"SDR",ring:"#FFFFFF"},
  montpellier: {bg:"#F77F00",fg:"#003DA5",text:"MHSC",ring:"#003DA5"},
  strasbourg:  {bg:"#003DA5",fg:"#FFFFFF",text:"RCS",ring:"#FFFFFF"},
  nantes:      {bg:"#FFED00",fg:"#1D8348",text:"FCN",ring:"#1D8348"},
  toulouse:    {bg:"#6A0DAD",fg:"#FFFFFF",text:"TFC",ring:"#FFFFFF"},
  brest:       {bg:"#CC0000",fg:"#FFFFFF",text:"SB29",ring:"#FFFFFF"},
  le_havre:    {bg:"#003DA5",fg:"#FFFFFF",text:"HAC",ring:"#FFFFFF"},
  angers:      {bg:"#000000",fg:"#FFFFFF",text:"SCO",ring:"#FFFFFF"},
  auxerre:     {bg:"#003DA5",fg:"#FFFFFF",text:"AJA",ring:"#FFFFFF"},
  saint_etienne:{bg:"#1D8348",fg:"#FFFFFF",text:"ASSE",ring:"#FFFFFF"},
  // 에레디비시
  ajax:        {bg:"#CC0000",fg:"#FFFFFF",text:"AFC",ring:"#FFFFFF"},
  psv:         {bg:"#CC0000",fg:"#FFFFFF",text:"PSV",ring:"#FFFFFF"},
  feyenoord:   {bg:"#CC0000",fg:"#FFFFFF",text:"FEY",ring:"#FFFFFF"},
  az_alkmaar:  {bg:"#CC0000",fg:"#FFFFFF",text:"AZ",ring:"#FFFFFF"},
  utrecht:     {bg:"#CC0000",fg:"#FFFFFF",text:"FCU",ring:"#FFFFFF"},
  twente:      {bg:"#CC0000",fg:"#FFFFFF",text:"FCT",ring:"#FFFFFF"},
  vitesse:     {bg:"#FFD700",fg:"#000000",text:"SBV",ring:"#000000"},
  groningen:   {bg:"#1D8348",fg:"#FFFFFF",text:"FCG",ring:"#FFFFFF"},
  heerenveen:  {bg:"#003DA5",fg:"#FFFFFF",text:"SCH",ring:"#FFFFFF"},
  sparta_rotterdam:{bg:"#CC0000",fg:"#FFFFFF",text:"SPA",ring:"#FFFFFF"},
  go_ahead:    {bg:"#FFD700",fg:"#1D8348",text:"GAE",ring:"#1D8348"},
  nac_breda:   {bg:"#CC0000",fg:"#FFD700",text:"NAC",ring:"#FFD700"},
  almere:      {bg:"#003DA5",fg:"#FFFFFF",text:"ACF",ring:"#FFFFFF"},
  pec_zwolle:  {bg:"#003DA5",fg:"#FFFFFF",text:"PEC",ring:"#FFFFFF"},
  heracles:    {bg:"#1D8348",fg:"#FFFFFF",text:"HER",ring:"#FFFFFF"},
  roda_jc:     {bg:"#FFD700",fg:"#000000",text:"RJC",ring:"#000000"},
  // MLS
  inter_miami: {bg:"#F7B5CD",fg:"#000000",text:"CF",ring:"#000000"},
  lafc:        {bg:"#000000",fg:"#C39E6D",text:"LAFC",ring:"#C39E6D"},
  la_galaxy:   {bg:"#00245D",fg:"#FFD700",text:"LAG",ring:"#FFD700"},
  seattle_sounders:{bg:"#5D9732",fg:"#003DA5",text:"SEA",ring:"#003DA5"},
  portland_timbers:{bg:"#004812",fg:"#EBE01A",text:"TIM",ring:"#EBE01A"},
  atlanta_united:{bg:"#80000A",fg:"#FFCD00",text:"ATL",ring:"#FFCD00"},
  new_york_city:{bg:"#6CABDD",fg:"#FFFFFF",text:"NYC",ring:"#00285E"},
  new_york_rb: {bg:"#CC0000",fg:"#FFD700",text:"NYRB",ring:"#FFD700"},
  // K리그1
  ulsan_hd:    {bg:"#0F3D7C",fg:"#FFFFFF",text:"UHD",ring:"#FFFFFF"},
  jeonbuk:     {bg:"#1B5E20",fg:"#FFD700",text:"JB",ring:"#FFD700"},
  pohang:      {bg:"#9E1B32",fg:"#000000",text:"POH",ring:"#000000"},
  fc_seoul:    {bg:"#CC0000",fg:"#000000",text:"SEO",ring:"#000000"},
  gwangju_fc:  {bg:"#F4A300",fg:"#1B1464",text:"GWJ",ring:"#1B1464"},
  daegu_fc:    {bg:"#0072CE",fg:"#FFD700",text:"DGU",ring:"#FFD700"},
  gangwon_fc:  {bg:"#F47920",fg:"#000000",text:"GW",ring:"#000000"},
  suwon_fc:    {bg:"#0033A0",fg:"#FFD700",text:"SUW",ring:"#FFD700"},
  daejeon:     {bg:"#7B2D8E",fg:"#FFFFFF",text:"DJ",ring:"#FFFFFF"},
  incheon:     {bg:"#0E4D92",fg:"#FFD700",text:"INC",ring:"#FFD700"},
  jeju_sk:     {bg:"#FF8200",fg:"#000000",text:"JEJ",ring:"#000000"},
  gimcheon:    {bg:"#006A4E",fg:"#FFFFFF",text:"GC",ring:"#FFFFFF"},
};
function ClubLogo({teamId, size=32}){
  const c = CLUB_COLORS[teamId];
  if(!c) return <div style={{width:size,height:size,borderRadius:"50%",background:"#e2e8f0",display:"flex",alignItems:"center",justifyContent:"center",fontSize:size*0.28,fontWeight:700,color:"#64748b",flexShrink:0}}>?</div>;
  const fs = size <= 24 ? size*0.28 : size <= 36 ? size*0.26 : size*0.22;
  const chars = c.text.length > 3 ? c.text.slice(0,3) : c.text;
  return (
    <div style={{width:size,height:size,borderRadius:"50%",background:c.bg,border:`2px solid ${c.ring}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:fs,fontWeight:900,color:c.fg,flexShrink:0,letterSpacing:"-0.5px",fontFamily:"Arial,sans-serif",boxSizing:"border-box"}}>
      {chars}
    </div>
  );
}

// ─── 포지션 색상 ───
function getPlayerAvatar(pos){
  const c={GK:"#f59e0b",CB:"#3b82f6",LB:"#06b6d4",RB:"#06b6d4",CDM:"#8b5cf6",CM:"#6366f1",CAM:"#ec4899",LW:"#10b981",RW:"#10b981",ST:"#ef4444",CF:"#f97316"};
  return c[pos]||"#64748b";
}
// ─── 은퇴식 헌사: 등급(레전드/베테랑/일반) × 포지션 × 커리어 기록에 따라 다양하게 생성 ───
const RETIREMENT_OPENERS={
  레전드:[
    p=>`구단 역사상 최고의 선수 중 한 명인 ${p.name}이(가) 현역 생활을 마무리합니다.`,
    p=>`${p.nat} 출신의 슈퍼스타 ${p.name}, 화려했던 커리어의 마지막 페이지를 장식합니다.`,
    p=>`한 시대를 풍미한 전설 ${p.name}이(가) 그라운드를 떠납니다.`,
    p=>`팬들의 영원한 사랑을 받았던 ${p.name}이(가) 은퇴를 선언합니다.`,
  ],
  베테랑:[
    p=>`오랜 시간 팀에 헌신한 ${p.name}을(를) 위한 작은 헌정 행사가 열립니다.`,
    p=>`묵묵히 팀을 지켜온 든든한 베테랑 ${p.name}이(가) 마지막 인사를 전합니다.`,
    p=>`수많은 경기를 함께한 ${p.name}이(가) 현역 생활에 마침표를 찍습니다.`,
  ],
  일반:[
    p=>`${p.name}이(가) 조용히 현역 은퇴를 선언합니다.`,
    p=>`${p.name}, 그동안의 활약에 감사드립니다.`,
    p=>`${p.name}이(가) 새로운 인생의 장을 위해 그라운드를 떠납니다.`,
  ],
};
const POSITION_FLAVOR_TEXT={
  GK:"굳건한 골문 수비로 팀의 최후방을 지켜왔습니다.",
  CB:"흔들림 없는 수비로 상대의 공격을 묵묵히 차단해왔습니다.",
  LB:"왼쪽 측면을 오가며 공수 양면에서 헌신했습니다.",
  RB:"오른쪽 측면을 오가며 공수 양면에서 헌신했습니다.",
  CDM:"중원에서 묵묵히 팀의 균형을 잡아주었습니다.",
  CM:"경기의 흐름을 조율하며 팀을 이끌었습니다.",
  CAM:"날카로운 패스와 창의적인 플레이로 공격을 지휘했습니다.",
  LW:"왼쪽 측면에서의 폭발적인 돌파로 팬들을 열광시켰습니다.",
  RW:"오른쪽 측면에서의 폭발적인 돌파로 팬들을 열광시켰습니다.",
  ST:"날카로운 골 감각으로 팀의 득점을 책임졌습니다.",
  CF:"최전방에서의 헌신적인 플레이로 공격을 이끌었습니다.",
};
const RETIREMENT_CLOSERS={
  레전드:[
    "클럽은 등번호 영구 보존을 결정했으며, 팬들의 기립 박수가 쏟아질 예정입니다.",
    "구단 박물관에 그의 유니폼이 영구 전시될 예정입니다.",
    "다음 세대의 어린 선수들에게 큰 영감을 남겼습니다.",
  ],
  베테랑:[
    "동료와 팬들이 따뜻한 감사를 전합니다.",
    "라커룸의 든든한 리더십은 어린 선수들에게 좋은 본보기가 되었습니다.",
  ],
  일반:[],
};
function buildRetirementTribute(p,tier,careerGoals,careerAssists,seasonsPlayed){
  const openers=RETIREMENT_OPENERS[tier]||RETIREMENT_OPENERS.일반;
  const opener=openers[Math.floor(Math.random()*openers.length)](p);
  const flavor=POSITION_FLAVOR_TEXT[p.pos]||"";
  const statLine=(careerGoals>0||careerAssists>0)
    ?`커리어 통산 ${seasonsPlayed}시즌 동안 ${careerGoals}골 ${careerAssists}도움을 기록했습니다.`
    :seasonsPlayed>0?`커리어 통산 ${seasonsPlayed}시즌을 함께했습니다.`:"";
  const closers=RETIREMENT_CLOSERS[tier]||[];
  const closer=closers.length>0?closers[Math.floor(Math.random()*closers.length)]:"";
  return[opener,flavor,statLine,closer].filter(Boolean).join(" ");
}
// ─── 에이징 커브 시스템 ───
// 38세 초과부터 능력치 하락 시작
function getAgingDecline(age){if(age<=41)return 0;if(age<=43)return 1.0;if(age<=45)return 2.5;return 4.5;}
// potRankInfo: pool은 컴포넌트 레벨에서 useMemo로 캐싱해서 넘길 것
function getPotRankInfo(player,pool){
  const same=pool.filter(p=>p.age===player.age&&p.pos===player.pos);
  if(same.length===0)return{label:`동${player.age}세 ${player.pos} 1위/1`,color:"#64748b"};
  const sorted=[...same].sort((a,b)=>b.pot-a.pot);
  const rank=sorted.findIndex(p=>p.id===player.id)+1;
  const safeRank=rank>0?rank:sorted.findIndex(p=>p.pot<=player.pot)+1||sorted.length;
  const pct=safeRank/same.length;
  const color=pct<=0.05?"#7c3aed":pct<=0.15?"#2563eb":pct<=0.4?"#059669":pct<=0.7?"#d97706":"#64748b";
  return{label:`동${player.age}세 ${player.pos} ${safeRank}위/${same.length}`,color};
}
function getPotRank(player,pool){return getPotRankInfo(player,pool).label;}
function getPotRankColor(player,pool){return getPotRankInfo(player,pool).color;}
function getCondition(age,seasonCount){
  // 리그 시작 시 항상 100% 컨디션
  return 100;
}
// 경기 후 컨디션 하락량 계산 (나이가 많을수록 더 많이 하락)
function getConditionDrop(age){const pen=age<=28?0:age<=30?1:age<=32?2:age<=34?3:age<=36?5:7;return Math.round(5+pen+(Math.random()-0.5));}
// 컨디션 회복량 (경기 후 휴식 시뮬용, 현재는 미사용이지만 참고용)
function getConditionRecovery(age){
  if(age<=26)return Math.round(8+Math.random()*6);
  if(age<=29)return Math.round(6+Math.random()*5);
  if(age<=32)return Math.round(4+Math.random()*4);
  return Math.round(2+Math.random()*3);
}
// ─── 성장치: 잠재력 기반, 28세까지 성장 ───
function getGrowthRate(age,season,pot,rat){
  if(season<=1)return 0;
  if(age>28)return 0;
  // 잠재력과 현재 능력치 차이가 클수록 성장폭 큼
  const gap=Math.max(0,(pot||rat||75)-(rat||75));
  const potBonus=gap>=10?3:gap>=5?2:gap>=2?1:0;
  const r=Math.sin(age*13.7+season*7.3)*0.5+0.5;
  if(age<=19)return Math.floor(r*2)+1+potBonus;
  if(age<=22)return Math.floor(r*3)+2+potBonus;
  if(age<=25)return Math.floor(r*2)+1+potBonus;
  if(age<=28)return Math.floor(r*1.5)+potBonus;
  return 0;
}

const LEAGUES = {
  premier_league: { name:"프리미어리그", flag:"🏴󠁧󠁢󠁥󠁮󠁧󠁿", prestige:10, teams:[
    { id:"arsenal",      name:"아스날",              prestige:9,  budget:280, rivals:["tottenham"],  ts:"데이터 기반 영입" },
    { id:"man_city",     name:"맨체스터 시티",        prestige:10, budget:400, rivals:["man_utd"],            ts:"오일머니 대형 영입" },
    { id:"man_utd",      name:"맨체스터 유나이티드",  prestige:10, budget:350, rivals:["man_city"], ts:"마감 직전 급하게 영입" },
    { id:"liverpool",    name:"리버풀",               prestige:10, budget:320, rivals:["everton"],   ts:"가성비→빅머니 전환" },
    { id:"chelsea",      name:"첼시",                 prestige:9,  budget:380, rivals:[], ts:"대량 과소비 영입" },
    { id:"tottenham",    name:"토트넘",               prestige:8,  budget:200, rivals:["arsenal"],   ts:"선수 판매 후 재투자" },
    { id:"aston_villa",  name:"아스톤 빌라",          prestige:7,  budget:160, rivals:[],                           ts:"잠재력 높은 선수" },
    { id:"newcastle",    name:"뉴캐슬",               prestige:8,  budget:300, rivals:["sunderland"],               ts:"사우디 자본 대형 영입" },
    { id:"brighton",     name:"브라이튼",             prestige:7,  budget:130,  rivals:[],                           ts:"저평가 발굴 후 매각" },
    { id:"bournemouth",  name:"본머스",               prestige:6,  budget:90,  rivals:[],                           ts:"임대·자유이적 중심" },
    { id:"everton",      name:"에버턴",               prestige:7,  budget:110,  rivals:["liverpool"],                ts:"중간급 선수 영입" },
    { id:"fulham",       name:"풀럼",                 prestige:6,  budget:100,  rivals:[],                           ts:"임대 선호" },
    { id:"crystal_palace",name:"크리스탈 팰리스",     prestige:6,  budget:90,  rivals:[],                           ts:"경험 있는 선수 영입" },
    { id:"brentford",    name:"브렌트포드",           prestige:6,  budget:95,  rivals:[],                           ts:"데이터 기반 소규모" },
    { id:"nottm_forest", name:"노팅엄 포레스트",      prestige:6,  budget:100,  rivals:[],                           ts:"대량 영입(부주의)" },
    { id:"sunderland",   name:"선덜랜드",             prestige:6,  budget:85,  rivals:["newcastle"],                ts:"임대 중심" },
    { id:"leicester",    name:"레스터 시티",          prestige:6,  budget:105,  rivals:[],                           ts:"기회주의적 영입" },
    { id:"wolves",       name:"울버햄프턴",           prestige:6,  budget:95,  rivals:[],                           ts:"에이전트 연결망 활용" },
    { id:"leeds",        name:"리즈 유나이티드",      prestige:7,  budget:115,  rivals:[],                  ts:"젊은 선수 중심" },
    { id:"ipswich",      name:"입스위치 타운",        prestige:5,  budget:70,  rivals:[],                           ts:"소규모 영입" },
  ]},
  la_liga: { name:"라리가", flag:"🇪🇸", prestige:10, teams:[
    { id:"real_madrid",  name:"레알 마드리드",        prestige:10, budget:500, rivals:["barcelona"],          ts:"갈락티코 최고 선수 영입" },
    { id:"barcelona",    name:"FC 바르셀로나",        prestige:10, budget:380, rivals:["real_madrid"],             ts:"이코노믹 레버리지" },
    { id:"atletico",     name:"아틀레티코 마드리드",  prestige:9,  budget:240, rivals:["real_madrid"],             ts:"대형 영입 후 후회" },
    { id:"sevilla",      name:"세비야",               prestige:8,  budget:130,  rivals:["real_betis"],              ts:"임대 후 영구 이적" },
    { id:"real_betis",   name:"레알 베티스",          prestige:7,  budget:110,  rivals:["sevilla"],                 ts:"스페인 선수 우선" },
    { id:"real_sociedad",name:"레알 소시에다드",      prestige:7,  budget:100,  rivals:["athletic_bilbao"],         ts:"유스 우선" },
    { id:"athletic_bilbao",name:"아틀레틱 빌바오",   prestige:7,  budget:90,  rivals:["real_sociedad"],           ts:"바스크 출신만 영입" },
    { id:"villarreal",   name:"비야레알",             prestige:7,  budget:110,  rivals:[],                          ts:"중간급 선수 발굴" },
    { id:"valencia",     name:"발렌시아",             prestige:7,  budget:95,  rivals:[],                          ts:"재정난 매각 중심" },
    { id:"real_sociedad2",name:"셀타 비고",           prestige:6,  budget:75,  rivals:[],                          ts:"유망주 발굴" },
    { id:"girona",       name:"지로나",               prestige:6,  budget:88,  rivals:[],                          ts:"시티 그룹 임대망" },
    { id:"osasuna",      name:"오사수나",             prestige:6,  budget:65,  rivals:[],                          ts:"저렴한 영입" },
    { id:"getafe",       name:"헤타페",               prestige:5,  budget:55,  rivals:[],                          ts:"저렴한 영입" },
    { id:"mallorca",     name:"말로르카",             prestige:5,  budget:58,  rivals:[],                          ts:"임대 중심" },
    { id:"espanyol",     name:"에스파뇰",             prestige:6,  budget:72,  rivals:[],               ts:"소규모 영입" },
    { id:"alaves",       name:"알라베스",             prestige:5,  budget:48,  rivals:[],                          ts:"자유이적 선호" },
    { id:"rayo_vallecano",name:"라요 바예카노",       prestige:5,  budget:48,  rivals:[],                          ts:"무료 영입 중심" },
    { id:"leganes",      name:"레가네스",             prestige:5,  budget:44,  rivals:[],                          ts:"저렴한 영입" },
    { id:"las_palmas",   name:"라스팔마스",           prestige:5,  budget:50,  rivals:[],                          ts:"남미 선수 영입" },
    { id:"valladolid",   name:"바야돌리드",           prestige:5,  budget:44,  rivals:[],                          ts:"저렴한 영입" },
  ]},
  serie_a: { name:"세리에A", flag:"🇮🇹", prestige:9, teams:[
    { id:"inter",        name:"인터 밀란",            prestige:9,  budget:240, rivals:["ac_milan"],            ts:"임대 후 영구 이적" },
    { id:"ac_milan",     name:"AC 밀란",              prestige:9,  budget:210, rivals:["inter"],               ts:"자유이적 선수 발굴" },
    { id:"juventus",     name:"유벤투스",             prestige:9,  budget:230, rivals:["torino"],      ts:"대형 스타 영입 선호" },
    { id:"napoli",       name:"나폴리",               prestige:8,  budget:165, rivals:[],                          ts:"아프리카/남미 발굴" },
    { id:"roma",         name:"AS 로마",              prestige:8,  budget:160, rivals:["lazio"],                   ts:"스타+영리한 영입" },
    { id:"lazio",        name:"SS 라치오",            prestige:7,  budget:125,  rivals:["roma"],                    ts:"이탈리아 선수 선호" },
    { id:"atalanta",     name:"아탈란타",             prestige:8,  budget:145, rivals:[],                          ts:"유망주 발굴·성장" },
    { id:"fiorentina",   name:"피오렌티나",           prestige:7,  budget:115,  rivals:[],                          ts:"이탈리아 클래식 영입" },
    { id:"torino",       name:"토리노",               prestige:6,  budget:80,  rivals:["juventus"],                ts:"소규모 영입" },
    { id:"bologna",      name:"볼로냐",               prestige:6,  budget:88,  rivals:[],                          ts:"유망주 영입" },
    { id:"udinese",      name:"우디네세",             prestige:6,  budget:72,  rivals:[],                          ts:"남미/아프리카 저평가" },
    { id:"empoli",       name:"엠폴리",               prestige:5,  budget:55,  rivals:[],                          ts:"임대 중심" },
    { id:"cagliari",     name:"칼리아리",             prestige:5,  budget:60,  rivals:[],                          ts:"임대 선호" },
    { id:"genoa",        name:"제노아",               prestige:5,  budget:62,  rivals:[],                          ts:"소규모 영입" },
    { id:"hellas_verona",name:"엘라스 베로나",        prestige:5,  budget:55,  rivals:[],                          ts:"자유이적 위주" },
    { id:"lecce",        name:"레체",                 prestige:5,  budget:50,  rivals:[],                          ts:"저렴한 영입" },
    { id:"parma",        name:"파르마",               prestige:6,  budget:72,  rivals:[],                          ts:"선수 개발 중심" },
    { id:"como",         name:"코모",                 prestige:5,  budget:78,  rivals:[],                          ts:"인버토니 스타일" },
    { id:"venezia",      name:"베네치아",             prestige:5,  budget:55,  rivals:[],                          ts:"임대 중심" },
    { id:"monza",        name:"몬자",                 prestige:5,  budget:62,  rivals:[],                          ts:"베를루스코니 자본" },
  ]},
  bundesliga: { name:"분데스리가", flag:"🇩🇪", prestige:9, teams:[
    { id:"bayern",       name:"바이에른 뮌헨",        prestige:10, budget:450, rivals:["dortmund"],                ts:"세계최고+분데스 흡수" },
    { id:"dortmund",     name:"보루시아 도르트문트",  prestige:8,  budget:210, rivals:["bayern"],                  ts:"유망주 발굴 후 매각" },
    { id:"leverkusen",   name:"바이어 레버쿠젠",      prestige:8,  budget:195, rivals:[],                          ts:"창의적 영입+유망주" },
    { id:"rb_leipzig",   name:"RB 라이프치히",        prestige:7,  budget:175, rivals:[],                          ts:"레드불 네트워크" },
    { id:"frankfurt",    name:"아인트라흐트 프랑크푸르트",prestige:7,budget:130, rivals:[],                          ts:"저평가 선수 발굴" },
    { id:"wolfsburg",    name:"VfL 볼프스부르크",     prestige:7,  budget:135,  rivals:[],                          ts:"폭스바겐 자본 투자" },
    { id:"stuttgart",    name:"VfB 슈투트가르트",     prestige:7,  budget:128,  rivals:[],                          ts:"유망주 육성 후 판매" },
    { id:"gladbach",     name:"보루시아 묀헨글라트바흐",prestige:7,budget:112,  rivals:[],                          ts:"중간급 영입" },
    { id:"werder",       name:"베르더 브레멘",        prestige:6,  budget:88,  rivals:[],                          ts:"유망주 중심" },
    { id:"union_berlin", name:"유니온 베를린",        prestige:6,  budget:80,  rivals:[],                          ts:"자유이적+저렴한 영입" },
    { id:"augsburg",     name:"FC 아우크스부르크",    prestige:5,  budget:64,  rivals:[],                          ts:"소규모 영입" },
    { id:"freiburg",     name:"SC 프라이부르크",      prestige:6,  budget:88,  rivals:[],                          ts:"유망주 발굴" },
    { id:"mainz",        name:"FSV 마인츠",           prestige:6,  budget:80,  rivals:[],                          ts:"분석적 영입" },
    { id:"hoffenheim",   name:"TSG 호펜하임",         prestige:6,  budget:88,  rivals:[],                          ts:"데이터 기반 영입" },
    { id:"heidenheim",   name:"FC 하이덴하임",        prestige:5,  budget:56,  rivals:[],                          ts:"저렴한 영입" },
    { id:"st_pauli",     name:"FC 장크트파울리",      prestige:5,  budget:60,  rivals:[],                          ts:"저렴한 영입" },
    { id:"bochum",       name:"VfL 보훔",             prestige:5,  budget:56,  rivals:[],                          ts:"자유이적 선호" },
    { id:"holstein_kiel",name:"홀슈타인 킬",          prestige:5,  budget:50,  rivals:[],                          ts:"저렴한 영입" },
  ]},
  ligue_1: { name:"리그1", flag:"🇫🇷", prestige:8, teams:[
    { id:"psg",          name:"파리 생제르맹",        prestige:10, budget:700, rivals:[],                          ts:"카타르 자본 무제한 영입" },
    { id:"monaco",       name:"AS 모나코",            prestige:8,  budget:175, rivals:[],                          ts:"유망주 발굴 후 판매" },
    { id:"olympique_marseille",name:"올림피크 마르세유",prestige:8,budget:150, rivals:["lyon"],                     ts:"남미/아프리카 선수 영입" },
    { id:"lyon",         name:"올림피크 리옹",        prestige:8,  budget:145, rivals:["olympique_marseille"],                          ts:"유스 아카데미 특화" },
    { id:"lille",        name:"릴 OSC",               prestige:7,  budget:118,  rivals:[],                          ts:"유망주 발굴 및 매각" },
    { id:"rennes",       name:"스타드 렌",            prestige:7,  budget:108,  rivals:[],                          ts:"프랑스 유망주 영입" },
    { id:"nice",         name:"OGC 니스",             prestige:7,  budget:115,  rivals:[],                          ts:"인업 그룹 투자" },
    { id:"lens",         name:"RC 랑스",              prestige:6,  budget:92,  rivals:[],                   ts:"저예산 효율 영입" },
    { id:"reims",        name:"스타드 드 랭스",       prestige:6,  budget:72,  rivals:[],                          ts:"소규모 영입" },
    { id:"montpellier",  name:"몽펠리에 HSC",         prestige:6,  budget:68,  rivals:[],                          ts:"저렴한 영입" },
    { id:"strasbourg",   name:"RC 스트라스부르",      prestige:6,  budget:76,  rivals:[],                          ts:"소규모 영입" },
    { id:"nantes",       name:"FC 낭트",              prestige:6,  budget:70,  rivals:[],                          ts:"자유이적 위주" },
    { id:"toulouse",     name:"툴루즈 FC",            prestige:5,  budget:60,  rivals:[],                          ts:"소규모 영입" },
    { id:"brest",        name:"스타드 브레스트",      prestige:5,  budget:60,  rivals:[],                          ts:"저렴한 영입" },
    { id:"le_havre",     name:"르아브르 AC",          prestige:5,  budget:50,  rivals:[],                          ts:"유스 중심" },
    { id:"angers",       name:"SCO 앙제",             prestige:5,  budget:48,  rivals:[],                          ts:"자유이적" },
    { id:"auxerre",      name:"AJ 오세르",            prestige:5,  budget:50,  rivals:[],                          ts:"소규모 영입" },
    { id:"saint_etienne",name:"생테티엔",             prestige:6,  budget:66,  rivals:["lyon"],                    ts:"중간급 영입" },
  ]},
  eredivisie: { name:"에레디비시", flag:"🇳🇱", prestige:7, teams:[
    { id:"ajax",         name:"AFC 아약스",           prestige:9,  budget:175, rivals:["feyenoord"],               ts:"유스 아카데미+고수익 매각" },
    { id:"psv",          name:"PSV 에인트호번",       prestige:8,  budget:158, rivals:[],                    ts:"필립스 그룹 지원" },
    { id:"feyenoord",    name:"페예노르트",           prestige:8,  budget:150,  rivals:["ajax"],                    ts:"남미 선수 중심" },
    { id:"az_alkmaar",   name:"AZ 알크마르",          prestige:7,  budget:102,  rivals:[],                          ts:"유망주 발굴" },
    { id:"utrecht",      name:"FC 위트레흐트",        prestige:6,  budget:76,  rivals:[],                          ts:"소규모 영입" },
    { id:"twente",       name:"FC 트벤테",            prestige:6,  budget:76,  rivals:[],                          ts:"임대 중심" },
    { id:"vitesse",      name:"SBV 비테세",           prestige:6,  budget:66,  rivals:[],                          ts:"임대 중심" },
    { id:"groningen",    name:"FC 흐로닝언",          prestige:5,  budget:56,  rivals:[],                          ts:"저렴한 영입" },
    { id:"heerenveen",   name:"SC 헤이런뻔",          prestige:5,  budget:58,  rivals:[],                          ts:"소규모 영입" },
    { id:"sparta_rotterdam",name:"스파르타 로테르담", prestige:5,  budget:48,  rivals:[],               ts:"저렴한 영입" },
    { id:"go_ahead",     name:"고어헤드 이글스",      prestige:4,  budget:40,  rivals:[],                          ts:"자유이적" },
    { id:"nac_breda",    name:"NAC 브레다",           prestige:4,  budget:40,  rivals:[],                          ts:"자유이적" },
    { id:"almere",       name:"알미어 시티",          prestige:4,  budget:36,  rivals:[],                          ts:"소규모 영입" },
    { id:"pec_zwolle",   name:"PEC 즈볼러",           prestige:4,  budget:32,  rivals:[],                          ts:"저렴한 영입" },
    { id:"heracles",     name:"헤라클레스 알멜로",    prestige:4,  budget:32,  rivals:[],                          ts:"소규모 영입" },
    { id:"roda_jc",      name:"로다 JC",              prestige:4,  budget:36,  rivals:[],                          ts:"자유이적" },
  ]},
  mls: { name:"MLS", flag:"🇺🇸", prestige:6, teams:[
    { id:"inter_miami",  name:"인터 마이애미",        prestige:7,  budget:220, rivals:[],                          ts:"글로벌 스타 영입 (메시)" },
    { id:"lafc",         name:"LA FC",                prestige:7,  budget:165, rivals:["la_galaxy"],               ts:"지명도 있는 선수 영입" },
    { id:"la_galaxy",    name:"LA 갤럭시",            prestige:7,  budget:155,  rivals:["lafc"],                    ts:"레전드 영입 전통" },
    { id:"seattle_sounders",name:"시애틀 사운더스",   prestige:6,  budget:118,  rivals:[],        ts:"균형 잡힌 영입" },
    { id:"portland_timbers",name:"포틀랜드 팀버스",   prestige:6,  budget:102,  rivals:[],        ts:"남미 선수 중심" },
    { id:"atlanta_united",name:"애틀랜타 유나이티드", prestige:6,  budget:110,  rivals:[],                          ts:"남미 선수 영입" },
    { id:"new_york_city",name:"뉴욕 시티 FC",        prestige:6,  budget:118,  rivals:["new_york_rb"],             ts:"시티 그룹 임대망" },
    { id:"new_york_rb",  name:"뉴욕 레드불스",       prestige:6,  budget:108,  rivals:["new_york_city"],           ts:"레드불 네트워크" },
    { id:"columbus_crew",name:"콜럼버스 크루",        prestige:6,  budget:95,  rivals:[],                          ts:"균형 영입" },
    { id:"toronto_fc",   name:"토론토 FC",            prestige:6,  budget:105,  rivals:[],                          ts:"스타 선수 영입 전통" },
    { id:"nashville_sc", name:"내슈빌 SC",            prestige:5,  budget:88,  rivals:[],                          ts:"균형 영입" },
    { id:"cf_montreal",  name:"CF 몬트리올",          prestige:5,  budget:80,  rivals:[],              ts:"저렴한 영입" },
    { id:"austin_fc",    name:"오스틴 FC",            prestige:5,  budget:82,  rivals:[],                          ts:"소규모 영입" },
    { id:"fc_cincinnati",name:"FC 신시내티",          prestige:5,  budget:80,  rivals:[],                          ts:"중간급 영입" },
    { id:"philadelphia_union",name:"필라델피아 유니온",prestige:5, budget:80,  rivals:[],                          ts:"분석적 영입" },
    { id:"dc_united",    name:"DC 유나이티드",        prestige:5,  budget:76,  rivals:[],                          ts:"소규모 영입" },
    { id:"new_england",  name:"뉴잉글랜드 레볼루션",  prestige:5,  budget:80,  rivals:[],                          ts:"유망주 중심" },
    { id:"chicago_fire", name:"시카고 파이어",        prestige:5,  budget:88,  rivals:[],                          ts:"소규모 영입" },
    { id:"sporting_kc",  name:"스포팅 캔자스시티",   prestige:5,  budget:80,  rivals:[],                          ts:"균형 영입" },
    { id:"real_salt_lake",name:"레알 솔트레이크",    prestige:5,  budget:80,  rivals:[],                          ts:"유망주 발굴" },
  ]},
  k_league: { name:"K리그1", flag:"🇰🇷", prestige:6, teams:[
    { id:"ulsan_hd",   name:"울산 HD",         prestige:7, budget:55,  rivals:["pohang"],   ts:"국내 핵심 선수 중심 영입" },
    { id:"jeonbuk",    name:"전북 현대모터스",  prestige:7, budget:58,  rivals:["fc_seoul"], ts:"공격적 대형 영입" },
    { id:"pohang",     name:"포항 스틸러스",    prestige:6, budget:42,  rivals:["ulsan_hd"], ts:"유스 육성 중심" },
    { id:"fc_seoul",   name:"FC서울",          prestige:6, budget:50,  rivals:["jeonbuk"],  ts:"수도권 스타 영입" },
    { id:"gwangju_fc", name:"광주FC",          prestige:5, budget:30,  rivals:[],           ts:"실용적 저예산 영입" },
    { id:"daegu_fc",   name:"대구FC",          prestige:5, budget:32,  rivals:[],           ts:"중간급 영입" },
    { id:"gangwon_fc", name:"강원FC",          prestige:5, budget:30,  rivals:[],           ts:"유망주 발굴" },
    { id:"suwon_fc",   name:"수원FC",          prestige:5, budget:28,  rivals:[],           ts:"소규모 영입" },
    { id:"daejeon",    name:"대전하나시티즌",   prestige:5, budget:32,  rivals:[],           ts:"공격적 중위권 영입" },
    { id:"incheon",    name:"인천 유나이티드",  prestige:5, budget:30,  rivals:[],           ts:"실속 영입" },
    { id:"jeju_sk",    name:"제주SK FC",       prestige:5, budget:30,  rivals:[],           ts:"균형 영입" },
    { id:"gimcheon",   name:"김천 상무",       prestige:5, budget:26,  rivals:[],           ts:"군 입대 선수 위주" },
  ]},
  saudi_pro: { name:"사우디 프로리그", flag:"🇸🇦", prestige:7, teams:[
    { id:"al_hilal",     name:"알 힐랄",              prestige:9,  budget:700, rivals:[],                ts:"무제한 오일머니 영입" },
    { id:"al_nassr",     name:"알 나스르",            prestige:8,  budget:550, rivals:[],                ts:"세계적 스타 영입(호날두)" },
    { id:"al_ittihad",   name:"알 이티하드",          prestige:8,  budget:420, rivals:[],                 ts:"유럽 스타 영입" },
    { id:"al_ahli",      name:"알 아흘리",            prestige:7,  budget:340, rivals:[],              ts:"남미 선수 영입" },
    { id:"al_qadsiah",   name:"알 카드시아",          prestige:6,  budget:165, rivals:[],                          ts:"유럽 중간급 선수" },
    { id:"al_shabab",    name:"알 샤밥",              prestige:6,  budget:148, rivals:[],                          ts:"중간급 영입" },
    { id:"al_ettifaq",   name:"알 에티파크",          prestige:6,  budget:148, rivals:[],                          ts:"유럽 선수 영입" },
    { id:"al_taawoun",   name:"알 타아운",            prestige:5,  budget:112,  rivals:[],                          ts:"아랍 선수 위주" },
    { id:"al_fayha",     name:"알 파이하",            prestige:5,  budget:105,  rivals:[],                          ts:"소규모 영입" },
    { id:"al_fateh",     name:"알 파테흐",            prestige:5,  budget:96,  rivals:[],                          ts:"저렴한 영입" },
    { id:"al_wehda",     name:"알 웨흐다",            prestige:5,  budget:90,  rivals:[],                          ts:"아랍 선수 우선" },
    { id:"damac",        name:"다마크 FC",            prestige:4,  budget:76,  rivals:[],                          ts:"저렴한 영입" },
    { id:"abha",         name:"압하 클럽",            prestige:4,  budget:70,  rivals:[],                          ts:"자유이적" },
    { id:"al_riyadh",    name:"알 리야드",            prestige:4,  budget:68,  rivals:[],                          ts:"소규모 영입" },
    { id:"al_hazm",      name:"알 하즘",              prestige:4,  budget:62,  rivals:[],                          ts:"자유이적" },
    { id:"al_orobah",    name:"알 오로바",            prestige:4,  budget:78,  rivals:[],                          ts:"소규모 영입" },
  ]},
};
const ALL_TEAMS = Object.values(LEAGUES).flatMap(l => l.teams);
/* ─── 컵 대회 ─── */
// qualifyRank: 리그 순위가 이 값 이하여야 출전 가능 (null = 제한 없음)
// qualifyMinGames: 최소 경기 수 (조건 판정 기준)
const CUPS = {
  champions_league: {
    name:"UEFA 챔피언스리그", short:"UCL", icon:"🏆",
    budgetBonus:80, wageBonus:3, fame:100,
    finalWageBonus:1.5,
    qualifyRank:4, qualifyMinGames:10,
    qualifyDesc:"리그 4위 이내 + UEFA 소속 리그",
    // UEFA 5대 리그 + 에레디비시 + 리그1 등 유럽 리그만 허용
    leagueRestrict:["premier_league","la_liga","serie_a","bundesliga","ligue_1","eredivisie"],
    leagueRestrictDesc:"유럽 리그 팀만 출전 가능",
    desc:"우승 시 예산 +€80M, 연봉한도 +€3M 영구 증가 / 결승 진출(준우승) +€1.5M"
  },
  europa_league: {
    name:"UEFA 유로파리그", short:"UEL", icon:"🥈",
    budgetBonus:45, wageBonus:1, fame:80,
    finalWageBonus:0.5,
    qualifyRank:7, qualifyMinGames:10,
    qualifyDesc:"리그 5~7위 + UEFA 소속 리그",
    leagueRestrict:["premier_league","la_liga","serie_a","bundesliga","ligue_1","eredivisie"],
    leagueRestrictDesc:"유럽 리그 팀만 출전 가능",
    desc:"우승 시 예산 +€45M, 연봉한도 +€1M 영구 증가 / 결승 진출(준우승) +€0.5M"
  },
  conference_league: {
    name:"UEFA 컨퍼런스리그", short:"UECL", icon:"🥉",
    budgetBonus:25, wageBonus:1, fame:60,
    finalWageBonus:0.5,
    qualifyRank:12, qualifyMinGames:10,
    qualifyDesc:"리그 8~12위 + UEFA 소속 리그",
    leagueRestrict:["premier_league","la_liga","serie_a","bundesliga","ligue_1","eredivisie"],
    leagueRestrictDesc:"유럽 리그 팀만 출전 가능",
    desc:"우승 시 예산 +€25M, 연봉한도 +€1M 영구 증가 / 결승 진출(준우승) +€0.5M"
  },
  fa_cup: {
    name:"FA컵", short:"FAC", icon:"🏅",
    budgetBonus:20, wageBonus:1, fame:70,
    finalWageBonus:0.5,
    qualifyRank:null, qualifyMinGames:0,
    qualifyDesc:"프리미어리그 팀 전원 참가",
    leagueRestrict:["premier_league"],
    leagueRestrictDesc:"프리미어리그 팀 전용",
    desc:"우승 시 예산 +€20M, 연봉한도 +€1M 영구 증가 / 결승 진출(준우승) +€0.5M"
  },
  league_cup: {
    name:"리그컵", short:"LC", icon:"🎖️",
    budgetBonus:15, wageBonus:1, fame:55,
    finalWageBonus:0.5,
    qualifyRank:null, qualifyMinGames:0,
    qualifyDesc:"프리미어리그 팀 전원 참가",
    leagueRestrict:["premier_league"],
    leagueRestrictDesc:"프리미어리그 팀 전용",
    desc:"우승 시 예산 +€15M, 연봉한도 +€1M 영구 증가 / 결승 진출(준우승) +€0.5M"
  },
  club_world_cup: {
    name:"FIFA 클럽 월드컵", short:"CWC", icon:"🌍",
    budgetBonus:60, wageBonus:2, fame:90,
    finalWageBonus:1,
    qualifyRank:1, qualifyMinGames:15,
    qualifyDesc:"전 리그 1위 팀만 출전",
    leagueRestrict:null, // 모든 리그 허용 (단 1위 필수)
    leagueRestrictDesc:"모든 리그의 1위 팀 출전",
    desc:"우승 시 예산 +€60M, 연봉한도 +€2M 영구 증가 / 결승 진출(준우승) +€1M"
  },
};
/* ─── 선수 데이터 200명+ ─── */

// ─── 매 시즌 신인 생성: 각 포지션마다 17세 2명, 포지션별 맞춤 스탯 ───
const NAT_POOL=["France","Germany","Spain","Brazil","Argentina","England","Netherlands","Portugal","Italy","Belgium","Norway","Denmark","Sweden","Japan","Korea Republic","Morocco","Senegal","Nigeria","Mexico","Colombia","Croatia","Serbia","Ghana","Austria","Switzerland"];
const NAT_POOL_NO_KR=NAT_POOL.filter(n=>n!=="Korea Republic"&&n!=="South Korea");
const VFIRST=["루이","마테우스","안드레","세르히오","토마스","알렉스","루카","마리오","카를로스","다비드","에릭","막스","알렉산더","조나스","파비오","이반","마르코","조슈아","아담","제임스","라파엘","오마르","사미","케빈","사샤","디에고","티아고","프레드","레온","유키","타로","민준","서준","지호"];
const VLAST=["실바","페레이라","가르시아","뮐러","로페스","마르티네스","산체스","로드리게스","페레즈","고메즈","얀센","디아스","리베이로","올리베이라","발렌시아","에스포시토","크래머","호프만","비에이라","나바스","로드","사토","스즈키","김","이","박"];

// 포지션별 스탯 기본값 정의
function makeFreshman(pos, season, idx, natPool, age=17, teamId=""){
  const nat=natPool[Math.floor(Math.random()*natPool.length)];
  const fname=VFIRST[Math.floor(Math.random()*VFIRST.length)];
  const lname=VLAST[Math.floor(Math.random()*VLAST.length)];
  const r=()=>Math.floor(Math.random()*20); // 0~19 랜덤 추가량
  // 나이별 스탯 패널티: 15세 -6, 16세 -3, 17세 0
  const agePen=Math.max(0,(17-age)*3);
  // 포지션별 기본 스탯 (17세 신인 기준)
  const base={
    GK: {rat:55+r(),pace:40+r(),sho:12+r(),pas:42+r(),dri:32+r(),def:50+r(),phy:50+r()},
    CB: {rat:55+r(),pace:52+r(),sho:22+r(),pas:46+r(),dri:40+r(),def:56+r(),phy:56+r()},
    LB: {rat:55+r(),pace:58+r(),sho:28+r(),pas:50+r(),dri:50+r(),def:50+r(),phy:52+r()},
    RB: {rat:55+r(),pace:58+r(),sho:28+r(),pas:50+r(),dri:50+r(),def:50+r(),phy:52+r()},
    CDM:{rat:55+r(),pace:52+r(),sho:38+r(),pas:52+r(),dri:52+r(),def:54+r(),phy:54+r()},
    CM: {rat:55+r(),pace:54+r(),sho:44+r(),pas:56+r(),dri:56+r(),def:44+r(),phy:50+r()},
    CAM:{rat:55+r(),pace:56+r(),sho:50+r(),pas:58+r(),dri:60+r(),def:32+r(),phy:46+r()},
    LW: {rat:55+r(),pace:62+r(),sho:48+r(),pas:52+r(),dri:62+r(),def:28+r(),phy:46+r()},
    RW: {rat:55+r(),pace:62+r(),sho:48+r(),pas:52+r(),dri:62+r(),def:28+r(),phy:46+r()},
    ST: {rat:55+r(),pace:60+r(),sho:58+r(),pas:44+r(),dri:56+r(),def:22+r(),phy:52+r()},
    CF: {rat:55+r(),pace:58+r(),sho:54+r(),pas:50+r(),dri:58+r(),def:26+r(),phy:48+r()},
  };
  const s=base[pos]||base.CM;
  const rat=Math.min(74-agePen, Math.max(45, s.rat-agePen));
  const pot=rat+12+Math.floor(Math.random()*20);
  const val=parseFloat(((0.8+Math.random()*5)*Math.max(0.4,1-(17-age)*0.2)).toFixed(1));
  return applyPlayerDefaults(nerfKoreanPlayer({
    id:`fresh_${season}_${pos}_${idx}_${Date.now()%100000}`,
    name:`${fname} ${lname}`,pos,age,nat,club:teamId,
    rat,pot:Math.min(96,pot),
    pace:Math.min(99,Math.max(30,s.pace-agePen)),
    sho:Math.min(99,Math.max(10,s.sho-agePen)),
    pas:Math.min(99,Math.max(30,s.pas-agePen)),
    dri:Math.min(99,Math.max(30,s.dri-agePen)),
    def:Math.min(99,Math.max(20,s.def-agePen)),
    phy:Math.min(99,Math.max(30,s.phy-agePen)),
    inj:Math.floor(Math.random()*3)+1,
    val,wage:parseFloat((val*0.07).toFixed(1)),
    peak:pot,peakY:2027+Math.floor(Math.random()*8),
    goals:0,ast:0,fame:10+Math.floor(Math.random()*20),
    bubble:false,leave:false,isVirtual:true,isYouth:true,
  }));
}

function generateYouthProspects(season, _count=22, natPool=NAT_POOL){
  // 각 포지션마다 정확히 2명씩 17세로 생성
  const players=[];
  POS_POOL.forEach(pos=>{
    players.push(makeFreshman(pos,season,0,natPool));
    players.push(makeFreshman(pos,season,1,natPool));
  });
  return players;
}
// ─── 5년에 한 번씩 등장하는 한국 천재 유망주 (이적시장 "한국 선수" 칸용) ───
const K_WONDER_FIRST=["민", "지", "현", "재", "도", "준", "성", "우"];
const K_WONDER_LAST=["김", "이", "박", "최", "정", "강", "조", "윤", "장", "한"];
const K_WONDER_GIVEN=["서준", "하준", "지호", "민준", "현우", "도윤", "예준", "주원", "시우", "건우"];
function generateKoreanWonderkid(season){
  const sur=K_WONDER_LAST[Math.floor(Math.random()*K_WONDER_LAST.length)];
  const giv=K_WONDER_GIVEN[Math.floor(Math.random()*K_WONDER_GIVEN.length)];
  const pos=POS_POOL[Math.floor(Math.random()*POS_POOL.length)];
  const age=17+Math.floor(Math.random()*3); // 17~19세
  const rat=66+Math.floor(Math.random()*8); // 66~73 (당장은 평범)
  const pot=90+Math.floor(Math.random()*8); // 90~97 (월드클래스급 잠재력)
  const val=parseFloat((8+Math.random()*7).toFixed(1));
  return{
    id:`kwonder_${season}_${Date.now()%100000}`,name:`${sur}${giv}`,pos,age,nat:"Korea Republic",club:"",
    rat,pot,pace:70+Math.floor(Math.random()*22),sho:62+Math.floor(Math.random()*26),
    pas:62+Math.floor(Math.random()*26),dri:65+Math.floor(Math.random()*26),
    def:(pos==="GK"||pos==="CB"||pos==="CDM")?60+Math.floor(Math.random()*28):35+Math.floor(Math.random()*28),
    phy:60+Math.floor(Math.random()*28),inj:1,val,wage:parseFloat((val*0.068).toFixed(1)),
    peak:pot,peakY:2025+Math.floor(Math.random()*10),
    goals:0,ast:0,fame:35+Math.floor(Math.random()*15),
    bubble:false,leave:false,isVirtual:true,isYouth:true,isWonderkid:true,
  };
}
// ─── 유스 아카데미: 15~20세, 전체 160개팀에 존재 ───
function generateAcademyYouth(teamId,count,seed){
  const players=[];
  for(let i=0;i<count;i++){
    const pos=POS_POOL[Math.floor(Math.random()*POS_POOL.length)];
    const age=15+Math.floor(Math.random()*6); // 15~20세
    // makeFreshman 공식 그대로 사용 (포지션별 base stats + 나이 패널티)
    const baseAge=Math.min(age,17);
    const p=makeFreshman(pos,seed,i,NAT_POOL,baseAge,teamId);
    // 18~20세는 makeFreshman(17세) 결과에서 성장치 추가 적용
    let aged={...p,age,id:`yt_${teamId}_${seed}_${i}_${Date.now()%100000}`};
    if(age>17){
      for(let y=17;y<age;y++){
        const g=getGrowthRate(y,seed,aged.pot,aged.rat);
        aged.rat=Math.max(45,Math.min(99,Math.round(aged.rat+g)));
        aged.pot=Math.max(aged.rat,aged.pot);
      }
    }
    players.push(aged);
  }
  return players;
}
// 전체 160개팀 유스 아카데미 풀 생성 (팀당 5명)
const ALL_YOUTH_PLAYERS=[];
ALL_TEAMS.forEach(t=>{
  ALL_YOUTH_PLAYERS.push(...generateAcademyYouth(t.id,5,0));
});

// ─── 상징적(아이콘) 선수: 호날두·메시급 전설 ───
// 컨디션 감소 없음, 에이징 하락 없음, 능력치 +10% 버프
// ─── 고가 선수 몸값 전체 재조정: €2200M(val≈146.67) 초과분 압축 ───
const VAL_CAP_THRESHOLD=2200/15; // ≈146.67
ALL_PLAYERS.forEach(p=>{
  if(p.val>VAL_CAP_THRESHOLD){
    // 초과분을 거듭제곱 압축(0.6승)하여 격차를 줄임 — 최고가도 ~€2400M 선으로 재조정
    const excess=p.val-VAL_CAP_THRESHOLD;
    p.val=parseFloat((VAL_CAP_THRESHOLD+Math.pow(excess,0.6)*1.05).toFixed(1));
  }
});
function isIconPlayer(p){return new Set(["p158023","p20801","p190871","p192985","p165153","p202126","p176580","p188545","p200104","m010","p155862"]).has(p.id);}
ALL_PLAYERS.forEach(p=>{
  if(isIconPlayer(p)){
    p.isIcon=true;
    // 8명 레전드 전용 버프: 스탯 +10%
    ["rat","pace","sho","pas","dri","def","phy"].forEach(k=>{
      if(typeof p[k]==="number")p[k]=Math.min(99,Math.round(p[k]*1.1));
    });
    p.pot=Math.max(p.pot,p.rat);
    // 👑 아이콘 선수 이적료 50% 할인, 연봉 €20M 고정, 계약금액(val×15) 최대 €6000M 제한
    p.val=parseFloat((Math.min(p.val*0.5, 400)).toFixed(1)); // val 최대 400 → 계약금액 6000
    p.wage=20; // 연봉 €20M/주 고정
  }
});
// ─── 동명이인(이름 중복) 선수 정리: 동일 이름은 1명만 남기고 제거, 제거된 수만큼 가상 선수로 보충 ───
(function dedupeDuplicateNamedPlayers(){
  const seen=new Set();
  let removed=0;
  const PROTECTED_IDS=new Set(["p200104"]);
  for(let i=0;i<ALL_PLAYERS.length;i++){const p=ALL_PLAYERS[i];if(PROTECTED_IDS.has(p.id))seen.add(p.name);}
  for(let i=ALL_PLAYERS.length-1;i>=0;i--){
    const p=ALL_PLAYERS[i];
    if(PROTECTED_IDS.has(p.id))continue;
    if(seen.has(p.name)){
      ALL_PLAYERS.splice(i,1);
      removed++;
    }else{
      seen.add(p.name);
    }
  }
  for(let i=0;i<removed;i++){
    const pos=POS_POOL[Math.floor(Math.random()*POS_POOL.length)];
    const nat=NAT_POOL[Math.floor(Math.random()*NAT_POOL.length)];
    const fname=VFIRST[Math.floor(Math.random()*VFIRST.length)];
    const lname=VLAST[Math.floor(Math.random()*VLAST.length)];
    const age=20+Math.floor(Math.random()*12); // 20~31세
    const rat=72+Math.floor(Math.random()*18); // 72~89
    const pot=Math.min(96,rat+Math.floor(Math.random()*10));
    const val=parseFloat((Math.random()*40+5).toFixed(1));
    ALL_PLAYERS.push(nerfKoreanPlayer({
      id:`dv${i}_${Date.now()%100000}`,name:`${fname} ${lname}`,pos,age,nat,club:"",
      rat,pot,pace:55+Math.floor(Math.random()*40),sho:48+Math.floor(Math.random()*40),
      pas:50+Math.floor(Math.random()*38),dri:50+Math.floor(Math.random()*40),
      def:(pos==="GK"||pos==="CB"||pos==="CDM")?58+Math.floor(Math.random()*32):28+Math.floor(Math.random()*32),
      phy:55+Math.floor(Math.random()*35),inj:Math.floor(Math.random()*4)+1,val,
      wage:parseFloat((val*0.085).toFixed(1)),peak:rat,peakY:2025+Math.floor(Math.random()*6),
      goals:0,ast:0,fame:40+Math.floor(Math.random()*30),bubble:false,leave:false,isVirtual:true,
    }));
  }
})();

const SEASON_MATCHES = 38; // 리그 시즌 총 경기 수
const AI_MATCH_INTERVAL = 1; // 플레이어 1경기당 AI 팀 경기 수
const INJTYPES=[
  {t:"근육 경련",d:3},{t:"발목 염좌",d:4},{t:"햄스트링 부상",d:5},
  {t:"타박상",d:4},{t:"무릎 경미 부상",d:6},{t:"종아리 부상",d:7},
  {t:"십자인대 파열 (시즌아웃)",d:38},{t:"발목 인대 파열 (시즌아웃)",d:38},{t:"대퇴부 골절 (시즌아웃)",d:38},
]; // d = 결장 경기 수 (3~7경기, 시즌아웃=38경기)
function fmt(v){if(!v&&v!==0)return"€0M";if(v>=100)return`€${Math.round(v)}M`;return`€${v.toFixed(1)}M`;}

// 위상(prestige)에 따라 선수 능력치를 보정 — 약팀이 강팀과 동일한 수준의 선수단을 갖는 문제를 보정
function adjustForPrestige(p,prestige){
  const pres=prestige||6;
  const reduction=Math.max(0,(10-pres)*1.0); // prestige 10: 0, prestige 5: -5 (기존 2.4→1.0, 상대팀 강화)
  if(reduction<=0)return {...p};
  const newRat=Math.max(58,Math.round(p.rat-reduction));
  const scale=newRat/p.rat;
  const sc=(v)=>Math.max(20,Math.round(v*scale));
  return {
    ...p,
    rat:newRat,
    pot:Math.max(newRat,Math.round((p.pot||p.rat)-reduction*0.7)),
    pace:sc(p.pace),sho:sc(p.sho),pas:sc(p.pas),dri:sc(p.dri),def:sc(p.def),phy:sc(p.phy),
    val:Math.max(0.4,parseFloat((p.val*Math.pow(scale,2.3)).toFixed(1))),
    wage:p.isIcon ? 20 : Math.max(0.3,parseFloat((p.wage*Math.pow(scale,1.8)).toFixed(1))),
    fame:Math.max(28,Math.round(p.fame-reduction*1.6)),
  };
}
// 팀 명성(prestige 4~10)에 따른 필드 플레이어(골키퍼 제외) 목표 평균 오버롤
// prestige 4 → 약 65, prestige 10 → 약 85 (선형 보간)
function getPrestigeTargetRat(prestige){
  const pres=Math.max(4,Math.min(10,prestige||6));
  return Math.round(65+(pres-4)*(20/6));
}
// 골키퍼를 제외한 필드 플레이어들의 평균 오버롤이 팀 명성에 맞는 목표치가 되도록 전체 스쿼드를 스케일링
function scaleSquadToPrestige(sq,prestige){
  const target=getPrestigeTargetRat(prestige);
  const outfield=sq.filter(p=>p.pos!=="GK");
  if(outfield.length===0)return sq;
  const curAvg=outfield.reduce((s,p)=>s+p.rat,0)/outfield.length;
  if(curAvg<=0)return sq;
  const scale=target/curAvg;
  return sq.map(p=>{
    if(p.pos==="GK")return p; // 골키퍼는 그대로 유지
    if(p.id==="p200104")return p; // 손흥민 스케일링 제외
    if(p.isIcon)return p; // 👑 아이콘 선수 스케일링 제외
    const newRat=Math.max(45,Math.min(99,Math.round(p.rat*scale)));
    const statScale=p.rat>0?newRat/p.rat:1;
    const sc=(v)=>Math.max(20,Math.min(99,Math.round(v*statScale)));
    return{
      ...p,
      rat:newRat,
      pot:Math.max(newRat,Math.min(99,Math.round((p.pot||p.rat)*statScale))),
      pace:sc(p.pace),sho:sc(p.sho),pas:sc(p.pas),dri:sc(p.dri),def:sc(p.def),phy:sc(p.phy),
      val:Math.max(0.3,parseFloat((p.val*Math.pow(statScale,2.3)).toFixed(1))),
      wage:Math.max(0.3,parseFloat((p.wage*Math.pow(statScale,1.8)).toFixed(1))),
      fame:Math.max(20,Math.round(p.fame*statScale)),
    };
  });
}

function buildSquad(teamId){
  const team=ALL_TEAMS.find(t=>t.id===teamId);
  const prestige=team?.prestige||6;
  const isKLeagueTeam=K_LEAGUE_CLUBS_FORCED.includes(teamId);
  const ownedRaw=ALL_PLAYERS.filter(p=>p.club===teamId);
  const isProtected=p=>(p.id==='p200104');
  const owned=(isKLeagueTeam?ownedRaw:ownedRaw.filter(p=>!isKoreanNat(p.nat)||isProtected(p))).map(p=>
    adjustForPrestige({...p,contractEndSeason:1+1+Math.floor(Math.random()*4)},prestige)
  );
  const poolRaw=[...ALL_PLAYERS].filter(p=>!owned.find(o=>o.id===p.id)).sort(()=>Math.random()-0.5);
  const pool=isKLeagueTeam?poolRaw:poolRaw.filter(p=>!isKoreanNat(p.nat)||isProtected(p));
  const sq=[...owned];
  const needs=[
    {pos:"GK",min:2},{pos:"CB",min:4},{pos:"RB",min:2},{pos:"LB",min:2},
    {pos:"CDM",min:2},{pos:"CM",min:3},{pos:"CAM",min:2},
    {pos:"RW",min:2},{pos:"LW",min:2},{pos:"ST",min:3},{pos:"CF",min:1},
  ];
  needs.forEach(({pos,min})=>{
    const have=sq.filter(p=>p.pos===pos).length;
    if(have<min){
      pool.filter(p=>p.pos===pos).slice(0,min-have).forEach(p=>{
        if(!sq.find(s=>s.id===p.id))sq.push(adjustForPrestige({...p,club:teamId,contractEndSeason:1+1+Math.floor(Math.random()*4)},prestige));
      });
    }
  });
  while(sq.length<28){
    const p=pool.find(pp=>!sq.find(s=>s.id===pp.id));
    if(!p)break;
    sq.push(adjustForPrestige({...p,club:teamId,contractEndSeason:1+1+Math.floor(Math.random()*4)},prestige));
  }
  const finalSq=scaleSquadToPrestige(sq.slice(0,30),prestige);
  const cap=getSalaryCap(team);
  const totalWage=finalSq.reduce((s,p)=>s+p.wage,0);
  if(totalWage>cap*0.95){
    const scale=Math.max(0.35,(cap*0.95)/totalWage);
    return finalSq.map(p=>p.isIcon?p:({...p,wage:Math.max(0.3,parseFloat((p.wage*scale).toFixed(1)))}));
  }
  return finalSq;
}
// 상대팀(컵/리그 AI) 임시 11인 스쿼드 생성 — 위상 보정 적용
function buildOpponentSquad(team){
  const owned=ALL_PLAYERS.filter(p=>p.club===team.id);
  const pool=[...ALL_PLAYERS].filter(p=>!owned.find(o=>o.id===p.id)).sort(()=>Math.random()-0.5);
  const needPos=["GK","CB","CB","LB","RB","CDM","CM","CM","LW","ST","RW"];
  const picks=[...owned];
  needPos.slice(owned.length).forEach(pos=>{
    let cand=pool.find(pp=>pp.pos===pos&&!picks.find(s=>s.id===pp.id));
    if(!cand)cand=pool.find(pp=>!picks.find(s=>s.id===pp.id));
    if(cand)picks.push(cand);
  });
  return picks.slice(0,11).map(p=>adjustForPrestige({...p,club:team.id},team.prestige||6));
}
// ─── 포메이션 (스쿼드 메이커) ───
// 각 슬롯: pos = 표시 라벨, compat = 해당 슬롯에 적합한 선수 포지션 목록(우선순위순)
const FORMATIONS={
  "4-3-3":[
    {pos:"GK",x:50,y:90,compat:["GK"]},
    {pos:"LB",x:14,y:70,compat:["LB","CB"]},{pos:"CB",x:36,y:73,compat:["CB"]},{pos:"CB",x:64,y:73,compat:["CB"]},{pos:"RB",x:86,y:70,compat:["RB","CB"]},
    {pos:"CDM",x:50,y:55,compat:["CDM","CM"]},
    {pos:"CM",x:28,y:42,compat:["CM","CDM","CAM"]},{pos:"CM",x:72,y:42,compat:["CM","CDM","CAM"]},
    {pos:"LW",x:14,y:18,compat:["LW","CAM"]},{pos:"ST",x:50,y:12,compat:["ST","CF"]},{pos:"RW",x:86,y:18,compat:["RW","CAM"]},
  ],
  "4-4-2":[
    {pos:"GK",x:50,y:90,compat:["GK"]},
    {pos:"LB",x:14,y:70,compat:["LB","CB"]},{pos:"CB",x:36,y:73,compat:["CB"]},{pos:"CB",x:64,y:73,compat:["CB"]},{pos:"RB",x:86,y:70,compat:["RB","CB"]},
    {pos:"LM",x:13,y:45,compat:["LW","CM","LB"]},{pos:"CM",x:38,y:48,compat:["CM","CDM","CAM"]},{pos:"CM",x:62,y:48,compat:["CM","CDM","CAM"]},{pos:"RM",x:87,y:45,compat:["RW","CM","RB"]},
    {pos:"ST",x:38,y:14,compat:["ST","CF"]},{pos:"ST",x:62,y:14,compat:["ST","CF"]},
  ],
  "4-2-3-1":[
    {pos:"GK",x:50,y:90,compat:["GK"]},
    {pos:"LB",x:14,y:70,compat:["LB","CB"]},{pos:"CB",x:36,y:73,compat:["CB"]},{pos:"CB",x:64,y:73,compat:["CB"]},{pos:"RB",x:86,y:70,compat:["RB","CB"]},
    {pos:"CDM",x:35,y:55,compat:["CDM","CM"]},{pos:"CDM",x:65,y:55,compat:["CDM","CM"]},
    {pos:"LW",x:14,y:30,compat:["LW","CAM"]},{pos:"CAM",x:50,y:28,compat:["CAM","CM"]},{pos:"RW",x:86,y:30,compat:["RW","CAM"]},
    {pos:"ST",x:50,y:10,compat:["ST","CF"]},
  ],
  "3-5-2":[
    {pos:"GK",x:50,y:90,compat:["GK"]},
    {pos:"CB",x:25,y:73,compat:["CB"]},{pos:"CB",x:50,y:76,compat:["CB"]},{pos:"CB",x:75,y:73,compat:["CB"]},
    {pos:"LM",x:11,y:46,compat:["LW","LB","CM"]},{pos:"CM",x:33,y:50,compat:["CM","CDM","CAM"]},{pos:"CM",x:50,y:54,compat:["CDM","CM"]},{pos:"CM",x:67,y:50,compat:["CM","CDM","CAM"]},{pos:"RM",x:89,y:46,compat:["RW","RB","CM"]},
    {pos:"ST",x:38,y:14,compat:["ST","CF"]},{pos:"ST",x:62,y:14,compat:["ST","CF"]},
  ],
  "5-3-2":[
    {pos:"GK",x:50,y:90,compat:["GK"]},
    {pos:"LWB",x:9,y:64,compat:["LB","LW"]},{pos:"CB",x:30,y:74,compat:["CB"]},{pos:"CB",x:50,y:77,compat:["CB"]},{pos:"CB",x:70,y:74,compat:["CB"]},{pos:"RWB",x:91,y:64,compat:["RB","RW"]},
    {pos:"CM",x:30,y:46,compat:["CM","CDM","CAM"]},{pos:"CM",x:50,y:50,compat:["CDM","CM"]},{pos:"CM",x:70,y:46,compat:["CM","CDM","CAM"]},
    {pos:"ST",x:38,y:14,compat:["ST","CF"]},{pos:"ST",x:62,y:14,compat:["ST","CF"]},
  ],
  "4-1-4-1":[
    {pos:"GK",x:50,y:90,compat:["GK"]},
    {pos:"LB",x:14,y:70,compat:["LB","CB"]},{pos:"CB",x:36,y:73,compat:["CB"]},{pos:"CB",x:64,y:73,compat:["CB"]},{pos:"RB",x:86,y:70,compat:["RB","CB"]},
    {pos:"CDM",x:50,y:56,compat:["CDM","CM"]},
    {pos:"LM",x:13,y:36,compat:["LW","CM","LB"]},{pos:"CM",x:38,y:38,compat:["CM","CDM","CAM"]},{pos:"CM",x:62,y:38,compat:["CM","CDM","CAM"]},{pos:"RM",x:87,y:36,compat:["RW","CM","RB"]},
    {pos:"ST",x:50,y:12,compat:["ST","CF"]},
  ],
  "3-4-3":[
    {pos:"GK",x:50,y:90,compat:["GK"]},
    {pos:"CB",x:25,y:73,compat:["CB"]},{pos:"CB",x:50,y:76,compat:["CB"]},{pos:"CB",x:75,y:73,compat:["CB"]},
    {pos:"LM",x:13,y:46,compat:["LW","LB","CM"]},{pos:"CM",x:38,y:50,compat:["CM","CDM","CAM"]},{pos:"CM",x:62,y:50,compat:["CM","CDM","CAM"]},{pos:"RM",x:87,y:46,compat:["RW","RB","CM"]},
    {pos:"LW",x:18,y:16,compat:["LW","CAM"]},{pos:"ST",x:50,y:10,compat:["ST","CF"]},{pos:"RW",x:82,y:16,compat:["RW","CAM"]},
  ],
};
const FORMATION_NAMES=Object.keys(FORMATIONS);
// ─── 계약 기간 & 계약 상한선 ───
// 계약 기간은 최대 18년까지 선택 가능. 계약 총액(현재 주급×8년 기준)을 계약년도로 나눠
// 연차별 주급 상한선을 산출한다 → 계약기간이 길어질수록 연간 주급 상한은 낮아진다.
const MAX_CONTRACT_YEARS=18;
const CONTRACT_YEAR_OPTIONS=[1,2,3,4,5,6,8,10,12,15,18];
const CONTRACT_CAP_BASE_YEARS=3; // 상한 산정 기준 연수 (너프)
function getContractCap(wage){return parseFloat((wage*CONTRACT_CAP_BASE_YEARS).toFixed(1));}
function getMaxWageForYears(wage,years){
  const cap=getContractCap(wage);
  return Math.max(0.3,parseFloat((cap/Math.max(1,years)).toFixed(1)));
}
function getCappedWage(wage,years){
  return Math.min(wage,getMaxWageForYears(wage,years));
}
// ─── 팀 연봉상한선 (Salary Cap) ───
// 모든 팀 동일하게 75 (위상 무관 고정값) — 영구 보너스(permWageBonus)는 별도로 누적

// 포지션별 기본 평점 범위, 패스성공률, 차단 수치 계산
// 포지션별 가중치로 골/어시스트 담당 선수 선택
function weightedPick(squad, type){
  // type: "goal" | "assist"
  const GOAL_W  ={ST:14,CF:11,LW:7,RW:7,CAM:5,CM:3,CDM:1,LB:1,RB:1,CB:0.3,GK:0.05};
  const ASSIST_W={CAM:10,CM:9,LW:8,RW:8,CDM:4,ST:3,CF:3,LB:3,RB:3,CB:1,GK:0.2};
  // 득점 확률 80% 강화 대상 선수 ID (×1.8 가중치 배율)
  const STAR_IDS=new Set(["p20801","p158023","p190871","p165153","p176580","p202126","p200104","p188545","m010"]);
  const weights = type==="goal"?GOAL_W:ASSIST_W;
  const MESSI_GOAL_W_OVERRIDE="p158023";
  const pool=squad.map(p=>({p,w:(type==="goal"&&p.id===MESSI_GOAL_W_OVERRIDE?GOAL_W["ST"]:weights[p.pos]||1)*(type==="goal"&&STAR_IDS.has(p.id)?1.8:1)}));
  const total=pool.reduce((s,x)=>s+x.w,0);
  let r=Math.random()*total;
  for(const {p,w} of pool){r-=w;if(r<=0)return p;}
  return pool[pool.length-1].p;
}
function calcPosStat(p, cond){
  const pos=p.pos||"CM";
  // 포지션별 평점 기준점 (min, range)
  const ratingBase={
    GK: [5.5,3.0], CB:[5.5,3.0], LB:[5.2,3.2], RB:[5.2,3.2],
    CDM:[5.3,3.2], CM:[5.2,3.5], CAM:[5.0,4.0],
    LW:[4.8,4.2],  RW:[4.8,4.2], ST:[4.5,4.5], CF:[4.8,4.2],
  };
  const [rMin,rRange]=ratingBase[pos]||[5.0,4.0];
  const baseRating=parseFloat(((rMin+Math.random()*rRange)*cond).toFixed(1));
  // 포지션별 패스 성공률 — 실제 축구 기준 반영
  // GK: 짧은 골킥 기준 55-70%, CB: 85-92%, CM/CAM: 85-91%, ST: 70-82%
  const pasVal=p.pas||60;
  const passAccMap={
    GK:  Math.min(72,Math.max(50,48+pasVal*0.22+(Math.random()-0.5)*4)),
    CB:  Math.min(94,Math.max(78,72+pasVal*0.22+(Math.random()-0.5)*3)),
    LB:  Math.min(93,Math.max(76,68+pasVal*0.24+(Math.random()-0.5)*3)),
    RB:  Math.min(93,Math.max(76,68+pasVal*0.24+(Math.random()-0.5)*3)),
    CDM: Math.min(95,Math.max(80,74+pasVal*0.22+(Math.random()-0.5)*3)),
    CM:  Math.min(95,Math.max(80,72+pasVal*0.24+(Math.random()-0.5)*3)),
    CAM: Math.min(94,Math.max(78,70+pasVal*0.24+(Math.random()-0.5)*4)),
    LW:  Math.min(90,Math.max(70,62+pasVal*0.22+(Math.random()-0.5)*4)),
    RW:  Math.min(90,Math.max(70,62+pasVal*0.22+(Math.random()-0.5)*4)),
    ST:  Math.min(85,Math.max(65,55+pasVal*0.20+(Math.random()-0.5)*5)),
    CF:  Math.min(88,Math.max(68,58+pasVal*0.22+(Math.random()-0.5)*4)),
  };
  const passAcc=Math.round((passAccMap[pos]||Math.min(90,Math.max(60,60+pasVal*0.22)))*cond);
  // 포지션별 차단 기대치 — GK는 0, 수비형일수록 높음
  const defVal=p.def||50;
  const intercMap={
    GK:0, CB:Math.round(defVal*0.10)+Math.floor(Math.random()*3),
    LB:Math.round(defVal*0.08)+Math.floor(Math.random()*3),
    RB:Math.round(defVal*0.08)+Math.floor(Math.random()*3),
    CDM:Math.round(defVal*0.07)+Math.floor(Math.random()*3),
    CM:Math.round(defVal*0.04)+Math.floor(Math.random()*2),
    CAM:Math.round(defVal*0.02)+Math.floor(Math.random()*2),
    LW:Math.round(defVal*0.02)+Math.floor(Math.random()*1),
    RW:Math.round(defVal*0.02)+Math.floor(Math.random()*1),
    ST:Math.round(defVal*0.01), CF:Math.round(defVal*0.01),
  };
  const interceptions=intercMap[pos]||0;
  return{baseRating,passAcc,interceptions};
}

function getSalaryCap(team){
  return 80;
}
// 포지션 빠른 검색 그룹
const POS_GROUPS={
  GK:["GK"],
  DF:["CB","LB","RB"],
  MF:["CDM","CM","CAM"],
  FW:["LW","RW","ST","CF"],
};
// 주어진 선수단으로 포메이션 슬롯에 자동 배치 (포지션 호환 우선, 평점 높은 순)
function autoAssignFormation(formationKey,sq,injuredIds,conds={}){
  const slots=FORMATIONS[formationKey];
  const available=sq.filter(p=>!injuredIds.includes(p.id)&&(conds[p.id]??100)>=30)
    .sort((a,b)=>{
      const ca=conds[a.id]??100,cb=conds[b.id]??100;
      return b.rat*(cb<50?0.8:cb<70?0.92:1)-a.rat*(ca<50?0.8:ca<70?0.92:1);
    });
  const used=new Set();const assign={};
  slots.forEach((slot,i)=>{
    let pick=null;
    slot.compat.some(pos=>{pick=available.find(p=>p.pos===pos&&!used.has(p.id));return!!pick;});
    if(!pick)pick=available.find(p=>!used.has(p.id));
    if(pick){assign[i]=pick.id;used.add(pick.id);}
  });
  return assign;
}
const TABS=["오버뷰","스쿼드","유스","이적시장","컵 대회","경기","재정","뉴스","순위표","평점","통계","구단 시설"];
const FAKE_TEMPLATES=[
  {id:"interest",label:"📡 여러 구단 관심설",fn:(p,teams)=>`[단독] ${p.name}, ${teams.map(t=>t.name).join("·")} 등 복수 구단 동시 영입 경쟁 — 에이전트 협상 가동`},
  {id:"sell",label:"📤 방출·이적설",fn:(p,teams)=>`[속보] ${p.name} 이번 여름 이적 확실시 — ${teams[0].name} 측 "선수 측과 이미 접촉"`},
  {id:"bid",label:"💰 거액 제안설",fn:(p,teams)=>`[특종] ${teams[0].name}, ${p.name}에 €${Math.round(p.val*1.4)}M 파격 제안 — 소속팀 당혹`},
  {id:"medical",label:"🏥 메디컬 임박설",fn:(p,teams)=>`[긴급] ${p.name} ${teams[0].name} 이적 메디컬 테스트 예약 완료 — 계약 조율만 남아`},
  {id:"reject",label:"🚫 이적 거부설",fn:(p,teams)=>`[반전] ${p.name}, ${teams.map(t=>t.name).join("·")} 제안 모두 거절 — "현 구단 잔류 의사 확고"`},
  {id:"hijack",label:"⚡ 막판 하이재킹설",fn:(p,teams)=>`[충격] ${p.name} 이적 막판 이변 — ${teams[1]?.name||teams[0].name} 갑자기 뛰어들어 협상 뒤집기 시도`},
];
const MVP_COMMENTS=[
  "압도적인 경기력으로 팀 승리를 이끌었다.",
  "2개의 결정적 찬스를 만들며 경기를 지배했다.",
  "수비와 공격 모두에서 빛났다.",
  "오늘 경기 최고의 패스 정확도를 기록했다.",
  "상대 에이스를 완벽히 봉쇄하며 수비 MVP로 선정됐다.",
  "후반 투입 후 경기 흐름을 완전히 바꿨다.",
  "3번의 키 패스로 팀 공격을 이끌었다.",
];

// ══════════════════════════════════════════════
// 2D 경기 뷰어 컴포넌트
// ══════════════════════════════════════════════
function Match2DViewer({homeSq,awaySq,homeTeam,awayTeam,events,formation,half,speed,paused,onSpeedChange,onPauseToggle,onHalfEnd,onSecondHalfEnd,getPlayerAvatar,FORMATIONS,initHg=0,initAg=0}){
  const {useState:S,useEffect:E,useRef:R,useCallback:CB}=React;
  const FIELD_W=340,FIELD_H=520;
  const TOTAL_TICKS=half===1?450:450; // 45분 = 450 tick (1tick=6초 실제)
  const tickRef=R(0);
  const rafRef=R(null);
  const lastTimeRef=R(null);
  const [tick,setTick]=S(0);
  const [hg,setHg]=S(initHg);
  const [ag,setAg]=S(initAg);
  const [ballPos,setBallPos]=S({x:50,y:50});
  const [playerPositions,setPlayerPositions]=S({});
  const [activeEvent,setActiveEvent]=S(null);
  const [eventPaused,setEventPaused]=S(false);
  const [minute,setMinute]=S(half===1?0:45);
  const [log,setLog]=S([]);
  const [tacticChoice,setTacticChoice]=S(null);
  const [showTacticModal,setShowTacticModal]=S(false);
  const [tacticEvent,setTacticEvent]=S(null);
  const [possession,setPossession]=S(50);
  const [ended,setEnded]=S(false);
  const speedRef=R(speed);
  const pausedRef=R(paused);
  E(()=>{speedRef.current=speed;},[speed]);
  E(()=>{pausedRef.current=paused;},[paused]);

  // 포메이션 슬롯 → 선수 매핑
  const fmSlots=FORMATIONS[formation]||FORMATIONS["4-3-3"];
  const homePositions=fmSlots.map((slot,i)=>({...slot,player:homeSq[i]||homeSq[0]}));
  // 원정팀은 y축 반전
  const awayPositions=fmSlots.map((slot,i)=>({x:100-slot.x,y:100-slot.y,pos:slot.pos,player:awaySq[i]||awaySq[0]}));

  // tick → 분 변환
  const tickToMin=t=>Math.floor(t/10)+(half===1?0:45);

  // 이벤트 목록 (tick 기준 매핑)
  const eventsWithTick=events.map(e=>({...e,tick:Math.round((e.min-(half===1?0:45))*10)})).filter(e=>e.tick>=0&&e.tick<=TOTAL_TICKS);

  // 선수 위치 계산 (공 위치 기반으로 물결처럼 움직임)
  const calcPositions=CB((t,bx,by)=>{
    const positions={};
    const phase=t*0.05;
    homePositions.forEach(({x,y,player},i)=>{
      if(!player)return;
      const noise=Math.sin(phase+i*1.3)*3+Math.cos(phase*0.7+i)*2;
      const ballPull=(bx-x)*0.04;
      positions[player.id]={x:Math.min(96,Math.max(4,x+noise+ballPull)),y:Math.min(96,Math.max(4,y+Math.cos(phase+i)*2)),home:true};
    });
    awayPositions.forEach(({x,y,player},i)=>{
      if(!player)return;
      const noise=Math.sin(phase+i*1.7+2)*3+Math.cos(phase*0.6+i+1)*2;
      const ballPull=(bx-x)*0.03;
      positions[player.id]={x:Math.min(96,Math.max(4,x+noise+ballPull)),y:Math.min(96,Math.max(4,y+Math.cos(phase+i+1)*2)),home:false};
    });
    return positions;
  },[homePositions,awayPositions]);

  // 공 이동 로직
  const calcBall=CB((t,prevBx,prevBy)=>{
    const nearEvent=eventsWithTick.find(e=>Math.abs(e.tick-t)<15);
    if(nearEvent&&nearEvent.type==="goal"){
      const isHome=nearEvent.home;
      return{x:isHome?Math.random()*20+5:Math.random()*20+75,y:isHome?Math.random()*10+5:Math.random()*10+85};
    }
    // 사인파 기반 자연스러운 공 이동
    const phase=t*0.08;
    const teamControl=Math.sin(t*0.03)*0.5+0.5;
    const tx=teamControl>0.5?25+Math.random()*20:55+Math.random()*20;
    const ty=teamControl>0.5?20+Math.sin(phase)*25:60+Math.sin(phase+1)*25;
    return{x:prevBx+(tx-prevBx)*0.06+Math.sin(phase*2)*4,y:prevBy+(ty-prevBy)*0.06+Math.cos(phase*1.5)*3};
  },[eventsWithTick]);

  E(()=>{
    if(ended)return;
    const loop=(timestamp)=>{
      if(!lastTimeRef.current)lastTimeRef.current=timestamp;
      if(pausedRef.current||showTacticModal){lastTimeRef.current=timestamp;rafRef.current=requestAnimationFrame(loop);return;}
      const elapsed=timestamp-lastTimeRef.current;
      const msPerTick=24/speedRef.current; // 1tick=24ms at x1 (25배 속도)
      if(elapsed>=msPerTick){
        lastTimeRef.current=timestamp;
        tickRef.current=tickRef.current+1;
        const t=tickRef.current;
        setTick(t);
        setMinute(tickToMin(t));
        // 이벤트 체크
        const ev=eventsWithTick.find(e=>e.tick===t);
        if(ev){
          setActiveEvent(ev);
          setLog(prev=>[{...ev,min:tickToMin(t)},...prev].slice(0,8));
          if(ev.type==="goal"){
            if(ev.home)setHg(g=>g+1);else setAg(g=>g+1);
          }
          // 전술 이벤트 (골/기회): 30% 확률로 전술 선택 팝업
          if((ev.type==="goal"||ev.type==="chance")&&Math.random()<0.3){
            setTacticEvent(ev);
            setShowTacticModal(true);
          }
        }
        // 공·선수 위치 업데이트
        setBallPos(prev=>{
          const nb=calcBall(t,prev.x,prev.y);
          setPlayerPositions(calcPositions(t,nb.x,nb.y));
          return nb;
        });
        // 점유율
        setPossession(prev=>Math.round(Math.max(30,Math.min(70,prev+(Math.random()-0.48)*2))));
        // 종료
        if(t>=TOTAL_TICKS){
          setEnded(true);
          setTimeout(()=>{
            if(half===1)onHalfEnd();
            else onSecondHalfEnd(events);
          },1200);
        }
      }
      rafRef.current=requestAnimationFrame(loop);
    };
    rafRef.current=requestAnimationFrame(loop);
    return()=>{if(rafRef.current)cancelAnimationFrame(rafRef.current);};
  },[ended,showTacticModal,calcBall,calcPositions,eventsWithTick,half,onHalfEnd,onSecondHalfEnd]);

  const homeName=homeTeam?.name||"홈팀";
  const awayName=awayTeam?.name||"원정팀";
  const curMin=minute;

  // 포지션 색상
  const posColor=(pos)=>{
    if(pos==="GK")return"#f59e0b";
    if(["CB","LB","RB","LWB","RWB"].includes(pos))return"#3b82f6";
    if(["CDM","CM","CAM","LM","RM"].includes(pos))return"#10b981";
    return"#ef4444";
  };

  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.92)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:500,padding:8}}>
      <div style={{width:Math.min(400,window.innerWidth-16),background:"#111",borderRadius:16,overflow:"hidden",boxShadow:"0 20px 60px rgba(0,0,0,0.8)",display:"flex",flexDirection:"column"}}>

        {/* 스코어보드 */}
        <div style={{background:"linear-gradient(135deg,#0f172a,#1e293b)",padding:"10px 16px",display:"flex",alignItems:"center",gap:12}}>
          <div style={{flex:1,textAlign:"center"}}>
            <div style={{fontWeight:800,fontSize:13,color:"#f8fafc",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{homeName}</div>
            <div style={{fontSize:10,color:"#94a3b8"}}>🏠 홈</div>
          </div>
          <div style={{textAlign:"center",minWidth:90}}>
            <div style={{fontSize:32,fontWeight:900,color:"#fff",letterSpacing:4,lineHeight:1}}>{hg} - {ag}</div>
            <div style={{fontSize:11,color:"#fbbf24",fontWeight:700,marginTop:2}}>{curMin}&apos;</div>
            <div style={{fontSize:9,color:"#64748b",marginTop:1}}>{half===1?"전반":"후반"} · {possession}% 점유</div>
          </div>
          <div style={{flex:1,textAlign:"center"}}>
            <div style={{fontWeight:800,fontSize:13,color:"#f8fafc",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{awayName}</div>
            <div style={{fontSize:10,color:"#94a3b8"}}>✈️ 원정</div>
          </div>
        </div>

        {/* 경기장 */}
        <div style={{position:"relative",background:"#2d6a2d",width:"100%",aspectRatio:"0.65",overflow:"hidden",flexShrink:0}}>
          {/* 필드 라인 SVG */}
          <svg style={{position:"absolute",inset:0,width:"100%",height:"100%"}} viewBox="0 0 100 154" preserveAspectRatio="none">
            {/* 잔디 줄무늬 */}
            {[0,1,2,3,4,5,6,7,8,9].map(i=>(
              <rect key={i} x={0} y={i*15.4} width={100} height={15.4} fill={i%2===0?"#2d6a2d":"#286228"} opacity={0.8}/>
            ))}
            {/* 외곽선 */}
            <rect x={4} y={3} width={92} height={148} fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth={0.8}/>
            {/* 하프라인 */}
            <line x1={4} y1={77} x2={96} y2={77} stroke="rgba(255,255,255,0.7)" strokeWidth={0.6}/>
            {/* 센터서클 */}
            <circle cx={50} cy={77} r={12} fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth={0.6}/>
            <circle cx={50} cy={77} r={0.8} fill="rgba(255,255,255,0.9)"/>
            {/* 홈 페널티 박스 */}
            <rect x={22} y={3} width={56} height={20} fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth={0.6}/>
            <rect x={34} y={3} width={32} height={10} fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth={0.6}/>
            <rect x={43} y={1} width={14} height={4} fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth={0.8}/>
            {/* 원정 페널티 박스 */}
            <rect x={22} y={131} width={56} height={20} fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth={0.6}/>
            <rect x={34} y={141} width={32} height={10} fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth={0.6}/>
            <rect x={43} y={149} width={14} height={4} fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth={0.8}/>
          </svg>

          {/* 선수들 (홈) */}
          {Object.entries(playerPositions).filter(([,pos])=>pos.home).map(([id,pos])=>{
            const p=homeSq.find(s=>s.id===id);
            if(!p)return null;
            const pColor=posColor(p.pos);
            return(
              <div key={id} style={{position:"absolute",left:`${pos.x}%`,top:`${pos.y}%`,transform:"translate(-50%,-50%)",textAlign:"center",zIndex:10}}>
                <div style={{width:22,height:22,borderRadius:"50%",background:pColor,border:"2px solid #fff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:7,fontWeight:800,color:"#fff",boxShadow:"0 2px 6px rgba(0,0,0,0.5)"}}>{p.pos.slice(0,2)}</div>
                <div style={{fontSize:7,color:"#fff",fontWeight:700,textShadow:"0 1px 3px rgba(0,0,0,0.9)",whiteSpace:"nowrap",marginTop:1,maxWidth:36,overflow:"hidden",textOverflow:"ellipsis"}}>{p.name.split(" ").pop().slice(0,6)}</div>
              </div>
            );
          })}

          {/* 선수들 (원정) */}
          {Object.entries(playerPositions).filter(([,pos])=>!pos.home).map(([id,pos])=>{
            const p=awaySq.find(s=>s.id===id);
            if(!p)return null;
            return(
              <div key={id} style={{position:"absolute",left:`${pos.x}%`,top:`${pos.y}%`,transform:"translate(-50%,-50%)",textAlign:"center",zIndex:10}}>
                <div style={{width:22,height:22,borderRadius:"50%",background:"#dc2626",border:"2px solid #fde68a",display:"flex",alignItems:"center",justifyContent:"center",fontSize:7,fontWeight:800,color:"#fff",boxShadow:"0 2px 6px rgba(0,0,0,0.5)"}}>{p.pos.slice(0,2)}</div>
                <div style={{fontSize:7,color:"#fde68a",fontWeight:700,textShadow:"0 1px 3px rgba(0,0,0,0.9)",whiteSpace:"nowrap",marginTop:1,maxWidth:36,overflow:"hidden",textOverflow:"ellipsis"}}>{p.name.split(" ").pop().slice(0,6)}</div>
              </div>
            );
          })}

          {/* 공 */}
          <div style={{position:"absolute",left:`${ballPos.x}%`,top:`${ballPos.y}%`,transform:"translate(-50%,-50%)",zIndex:20,pointerEvents:"none"}}>
            <div style={{width:10,height:10,borderRadius:"50%",background:"#fff",boxShadow:"0 0 6px rgba(255,255,255,0.9), 0 2px 4px rgba(0,0,0,0.5)",border:"1px solid #ddd"}}/>
          </div>

          {/* 골 플래시 */}
          {activeEvent?.type==="goal"&&(
            <div style={{position:"absolute",inset:0,background:activeEvent.home?"rgba(34,197,94,0.25)":"rgba(239,68,68,0.25)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:30,pointerEvents:"none"}}>
              <div style={{fontSize:36,animation:"bounce 0.3s",filter:"drop-shadow(0 0 10px rgba(255,200,0,0.8))"}}>⚽</div>
            </div>
          )}

          {/* 이벤트 로그 (좌상단) */}
          <div style={{position:"absolute",top:4,left:4,zIndex:25,display:"flex",flexDirection:"column",gap:2}}>
            {log.slice(0,4).map((e,i)=>(
              <div key={i} style={{fontSize:9,padding:"2px 6px",borderRadius:8,background:"rgba(0,0,0,0.75)",color:e.type==="goal"?"#4ade80":e.type==="injury"?"#f87171":e.type==="yellow"?"#fbbf24":e.type==="red"?"#ef4444":"#e2e8f0",fontWeight:700,backdropFilter:"blur(4px)",opacity:1-i*0.2}}>
                {e.min}&apos; {e.type==="goal"?"⚽":e.type==="injury"?"🩹":e.type==="yellow"?"🟨":e.type==="red"?"🟥":e.type==="save"?"🧤":"📌"} {e.player?.slice?.(0,8)||e.player}
              </div>
            ))}
          </div>

          {/* 점유율 바 */}
          <div style={{position:"absolute",bottom:4,left:"10%",right:"10%",zIndex:25}}>
            <div style={{height:4,borderRadius:2,background:"rgba(239,68,68,0.6)",overflow:"hidden"}}>
              <div style={{height:"100%",width:`${possession}%`,background:"rgba(59,130,246,0.9)",borderRadius:2,transition:"width 1s"}}/>
            </div>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:8,color:"rgba(255,255,255,0.7)",marginTop:2}}>
              <span>{possession}%</span><span>{100-possession}%</span>
            </div>
          </div>
        </div>

        {/* 컨트롤 바 */}
        <div style={{background:"#1e293b",padding:"10px 14px",display:"flex",alignItems:"center",gap:8}}>
          {/* 배속 버튼 */}
          {[1,2,4].map(s=>(
            <button key={s} onClick={()=>onSpeedChange(s)} style={{padding:"5px 10px",borderRadius:8,border:`1.5px solid ${speed===s?"#3b82f6":"#374151"}`,background:speed===s?"#1d4ed8":"transparent",color:speed===s?"#fff":"#94a3b8",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>{s===1?"표준":s===2?"빠름":"최고속"}</button>
          ))}
          <button onClick={onPauseToggle} style={{padding:"5px 12px",borderRadius:8,border:"1.5px solid #374151",background:"transparent",color:"#f8fafc",fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>{paused?"▶":"⏸"}</button>
          {/* 진행 바 */}
          <div style={{flex:1,height:4,background:"#374151",borderRadius:2,overflow:"hidden"}}>
            <div style={{height:"100%",width:`${Math.min(100,(tick/TOTAL_TICKS)*100)}%`,background:"#3b82f6",borderRadius:2,transition:"width 0.5s"}}/>
          </div>
          <span style={{fontSize:10,color:"#94a3b8",minWidth:28}}>{curMin}&apos;</span>
        </div>

        {/* 하단 전술 전략 표시 */}
        <div style={{background:"#0f172a",padding:"6px 14px",display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:10,color:"#64748b"}}>전술</span>
          {[{k:"press",l:"압박",ic:"⚡"},{k:"balanced",l:"균형",ic:"⚖️"},{k:"defensive",l:"수비",ic:"🛡️"}].map(({k,l,ic})=>(
            <button key={k} onClick={()=>setTacticChoice(k)} style={{padding:"3px 8px",borderRadius:6,border:`1px solid ${tacticChoice===k?"#3b82f6":"#374151"}`,background:tacticChoice===k?"#1d4ed8":"transparent",color:tacticChoice===k?"#fff":"#64748b",fontSize:10,cursor:"pointer",fontFamily:"inherit"}}>{ic}{l}</button>
          ))}
        </div>
      </div>

      {/* 전술 선택 팝업 */}
      {showTacticModal&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:600}}>
          <div style={{background:"#1e293b",borderRadius:16,padding:"20px",width:300,border:"1px solid #334155"}}>
            <div style={{textAlign:"center",marginBottom:14}}>
              <div style={{fontSize:24,marginBottom:6}}>{tacticEvent?.type==="goal"?(tacticEvent.home?"⚽ 골!":"😤 실점!"):"🎯 빅찬스!"}</div>
              <div style={{fontWeight:700,fontSize:14,color:"#f8fafc"}}>{hg} - {ag}</div>
              <div style={{fontSize:12,color:"#94a3b8",marginTop:4}}>{curMin}분 · 후반 전술을 선택하세요</div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:12}}>
              {[{k:"press",l:"압박",ic:"⚡",desc:"공격+15%"},{k:"balanced",l:"균형",ic:"⚖️",desc:"현상유지"},{k:"defensive",l:"수비",ic:"🛡️",desc:"수비+18%"}].map(({k,l,ic,desc})=>(
                <button key={k} onClick={()=>{setTacticChoice(k);setShowTacticModal(false);}} style={{padding:"10px 6px",borderRadius:10,border:`2px solid ${tacticChoice===k?"#3b82f6":"#334155"}`,background:tacticChoice===k?"#1d4ed8":"#0f172a",cursor:"pointer",fontFamily:"inherit",textAlign:"center"}}>
                  <div style={{fontSize:18,marginBottom:3}}>{ic}</div>
                  <div style={{fontWeight:700,fontSize:11,color:"#f8fafc"}}>{l}</div>
                  <div style={{fontSize:9,color:"#64748b",marginTop:2}}>{desc}</div>
                </button>
              ))}
            </div>
            <button onClick={()=>setShowTacticModal(false)} style={{width:"100%",padding:"9px",borderRadius:10,border:"none",background:"#334155",color:"#94a3b8",cursor:"pointer",fontFamily:"inherit",fontSize:13}}>계속 진행</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function FootballManager(){
  const [screen,setScreen]=useState("select");
  const [selLeague,setSelLeague]=useState(null);
  const [selTeam,setSelTeam]=useState(null);
  const [budget,setBudget]=useState(0);
  const [budgetBase,setBudgetBase]=useState(0);
  const [squad,setSquad]=useState([]);
  const [news,setNews]=useState([]);
  const [week,setWeek]=useState(1);
  const [season,setSeason]=useState(1);
  const [pts,setPts]=useState(0);
  const [fanApproval,setFanApproval]=useState(72);
  const [injured,setInjured]=useState([]);
  const [injuryMatches,setInjuryMatches]=useState({}); // {playerId: 남은 결장 경기수}
  const [youthSquad,setYouthSquad]=useState([]); // 2군(유스) 선수단
  const [showYouthDetail,setShowYouthDetail]=useState(null);
  const [showYouthScout,setShowYouthScout]=useState(false);
  const [contractYears,setContractYears]=useState(3); // 협상 시 계약기간(1~5년)
  const [showContractRenewal,setShowContractRenewal]=useState(false);
  const [renewalQueue,setRenewalQueue]=useState([]); // 계약만료 선수 목록
  const [tLog,setTLog]=useState([]);
  const [fakeUsed,setFakeUsed]=useState(false);
  const [notif,setNotif]=useState(null);
  const [tab,setTab]=useState("오버뷰");
  const [marketPage,setMarketPage]=useState(0);
  const MARKET_PAGE_SIZE=40;
  const [table,setTable]=useState([]);
  const [matchRes,setMatchRes]=useState(null);
  const [showMatch,setShowMatch]=useState(false);
  // ── 경기 관여 시스템 ──
  const [matchPhase,setMatchPhase]=useState(null); // null | "playing" | "halftime" | "result"
  const [matchLiveState,setMatchLiveState]=useState(null);
  const [halfTimeChoice,setHalfTimeChoice]=useState(null); // "press"|"balanced"|"defensive"
  const [liveSubstitution,setLiveSubstitution]=useState(null); // {outId, inId} — 현재 선택 중
  const [pendingSubs,setPendingSubs]=useState([]); // [{outId,inId,outName,inName}] — 확정된 교체 목록
  const [subSelectStep,setSubSelectStep]=useState("out"); // "out"|"in" — 교체 선택 단계
  const [showSubModal,setShowSubModal]=useState(false);
  const [matchBonus,setMatchBonus]=useState(0);

  const [tTarget,setTTarget]=useState(null);
  const [tOffer,setTOffer]=useState(0);
  const [showNeg,setShowNeg]=useState(false);
  const [detail,setDetail]=useState(null);
  const [showSell,setShowSell]=useState(false);
  const [sellTarget,setSellTarget]=useState(null);
  const [sellOffer,setSellOffer]=useState(0);
  const [showRetire,setShowRetire]=useState(false);
  const [retireTarget,setRetireTarget]=useState(null);
  const [retireTribute,setRetireTribute]=useState(""); // 선택된 선수의 은퇴 헌사 (랜덤 생성, 모달·뉴스에서 동일하게 사용)
  const [retireCareerInfo,setRetireCareerInfo]=useState(null); // {tier, approvalChange, careerGoals, careerAssists, seasonsPlayed}
  const [retiredLegends,setRetiredLegends]=useState([]); // 은퇴 선수 전체 기록 (명예의 전당)
  const [showHallOfFame,setShowHallOfFame]=useState(false);
  const [showFake,setShowFake]=useState(false);
  const [fakePlayer,setFakePlayer]=useState(null);
  const [fakeTemplate,setFakeTemplate]=useState(null);
  const [fakeExtraTeams,setFakeExtraTeams]=useState([]);
  const [showLineup,setShowLineup]=useState(false);
  const [editSlot,setEditSlot]=useState(null); // 포메이션 슬롯 편집 중인 인덱스
  const [formation,setFormation]=useState("4-3-3");
  const [lineupSlots,setLineupSlots]=useState({}); // {슬롯인덱스: 선수id}
  const lineup=useMemo(()=>Object.values(lineupSlots).filter(Boolean),[lineupSlots]); // 선발 11명 id 배열
  const [searchQ,setSearchQ]=useState("");
  const [posFilter,setPosFilter]=useState("all");
  const [maxVal,setMaxVal]=useState(5000);
  const [marketSort,setMarketSort]=useState("rat"); // "rat"|"age_asc"|"age_desc"|"val"
  const [customFormationMode,setCustomFormationMode]=useState(false);
  const [customSlotEdit,setCustomSlotEdit]=useState(null); // 커스텀 포메이션 편집 중 슬롯
  const [customFormationSlots,setCustomFormationSlots]=useState(null); // 자유 편집 모드 슬롯 오버라이드
  const [difficulty,setDifficulty]=useState("일반");
  const [leagueFilter,setLeagueFilter]=useState("all");
  const [cupProgress,setCupProgress]=useState({});
  const [wonTrophies,setWonTrophies]=useState([]);
  const [permBudgetBonus,setPermBudgetBonus]=useState(0);
  const [permWageBonus,setPermWageBonus]=useState(0);
  const [matchLog,setMatchLog]=useState([]); // 경기 텍스트 로그
  const [seasonFinished,setSeasonFinished]=useState(false);
  const [seasonSummary,setSeasonSummary]=useState(null);
  const [showSeasonEnd,setShowSeasonEnd]=useState(false);
  const [statSort,setStatSort]=useState("goals");
  const [playerRatings,setPlayerRatings]=useState({}); // 선수별 누적 평점 {id:{total,count,avg}}
  const [showPlayerRating,setShowPlayerRating]=useState(false);
  const [showWageAdjust,setShowWageAdjust]=useState(false);
  const [wageAdjustTarget,setWageAdjustTarget]=useState(null);
  const [wageAdjustAmount,setWageAdjustAmount]=useState(0);
  const [hijackedPlayers,setHijackedPlayers]=useState(new Set());
  const [hijackInfo,setHijackInfo]=useState(null);
  const [showHijackCompete,setShowHijackCompete]=useState(false);
  const [hijackBid,setHijackBid]=useState("");
  const [tOfferInput,setTOfferInput]=useState("");
  const [showAnalyst,setShowAnalyst]=useState(false); // 하이재킹된 선수 ID 목록
  // ── 구단 거절 시스템 ──
  const [showClubReject,setShowClubReject]=useState(false); // 원 소속 구단이 이적 거부한 경우
  const [clubRejectInfo,setClubRejectInfo]=useState(null); // {player, offer, buyoutFee}
  // ── 선수 연봉 카운터오퍼 ──
  const [showPlayerWageDemand,setShowPlayerWageDemand]=useState(false);
  const [playerWageDemandInfo,setPlayerWageDemandInfo]=useState(null); // {player, offer, finalFee, contractYears, demandWage, cappedWage}
  // ── 매각 대기 시스템 ──
  const [pendingSales,setPendingSales]=useState([]); // [{player, askFee, listedWeek}]
  const [showSaleResult,setShowSaleResult]=useState(false);
  const [saleResultInfo,setSaleResultInfo]=useState(null); // {player, askFee, sold, actualFee}
  // ── 유망주 임대 방출 [{player, toTeam, seasons, remainSeasons, gamesPlayed, seasonStart}] ──
  const [loanOutPlayers,setLoanOutPlayers]=useState([]);
  const [showLoanOut,setShowLoanOut]=useState(false);
  const [loanOutTarget,setLoanOutTarget]=useState(null);
  const [loanOutSeasons,setLoanOutSeasons]=useState(1);
  const [loanOutTeam,setLoanOutTeam]=useState(null);
  // ── FA 이적시장 필터 ──
  const [faMarketFilter,setFaMarketFilter]=useState(false); // true = FA 전용 표시
  const [faWageOffer,setFaWageOffer]=useState({}); // {playerId: wage}
  const [faPosFilter,setFaPosFilter]=useState("all");
  const [faMinOvr,setFaMinOvr]=useState(60);
  // ── 선수 사기(모럴) {id: 0-100, 기본 70} ──
  const [playerMorale,setPlayerMorale]=useState({}); // {playerId: 0-100}
  // ── 연속출전 피로 카운터 {id: consecutiveGames} ──
  const [consecutiveGames,setConsecutiveGames]=useState({});
  // ── 멘토링 페어 [{mentorId, studentId}] ──
  const [mentoringPairs,setMentoringPairs]=useState([]);
  const [showMentoring,setShowMentoring]=useState(false);
  // ── 팀 케미스트리 점수 (0-100) ──
  const [teamChemistry,setTeamChemistry]=useState(70);
  // ── 세트피스 훈련 레벨 (0-3) + 투자액 ──
  const [setpieceLevel,setSetpieceLevel]=useState(0);
  // ── 구단 시설 레벨 {training, medical, scout, stadium} ──
  const [facilityLevels,setFacilityLevels]=useState({training:1,medical:1,scout:1,stadium:1});
  const [showFacility,setShowFacility]=useState(false);
  // ── 이사회 목표 {type, target, bonus, deadline} ──
  const [boardObjective,setBoardObjective]=useState(null);
  const [showBoardObjective,setShowBoardObjective]=useState(false);
  // ── 기자회견 ──
  const [showPressConf,setShowPressConf]=useState(false);
  // ── 스폰서 계약 {name, annual, seasons} ──
  const [sponsorContract,setSponsorContract]=useState(null);
  const [showSponsor,setShowSponsor]=useState(false);
  // ── 임대 선수 [{player, fromClub, wageSplit, seasons, buyOption}] ──
  const [loanPlayers,setLoanPlayers]=useState([]);
  const [showLoanModal,setShowLoanModal]=useState(false);
  const [loanTarget,setLoanTarget]=useState(null);
  const [loanWageSplit,setLoanWageSplit]=useState(50); // 유저 부담 %
  // ── 분할납부 딜 [{player, totalFee, paid, remaining, perSeason}] ──
  const [installmentDeals,setInstallmentDeals]=useState([]);
  // ── 사전계약 (pre-contract) [{player, signingBonus, startSeason}] ──
  const [preContractPlayers,setPreContractPlayers]=useState([]);
  const [showPreContract,setShowPreContract]=useState(false);
  const [preContractTarget,setPreContractTarget]=useState(null);
  // ── 강등 위기 알림 ──
  const [showRelegationWarning,setShowRelegationWarning]=useState(false);
  // ── 은퇴식 종류 선택 ──
  const [retireTierChoice,setRetireTierChoice]=useState(null); // "레전드"|"베테랑"|"일반"
  const [playerConditions,setPlayerConditions]=useState({}); // 선수별 컨디션 {id: 0-100}
  const [showRatingModal,setShowRatingModal]=useState(false);
  const [showWageDemand,setShowWageDemand]=useState(false);
  const [wageDemandQueue,setWageDemandQueue]=useState([]);
  // ── 선수 계약해지 모달 ──
  const [showReleaseModal,setShowReleaseModal]=useState(false);
  // ── 유스 졸업식 & 연봉협상 ──
  const [youthGradQueue,setYouthGradQueue]=useState([]); // 졸업식 대상 (내 팀 유스 21세)
  const [showYouthGrad,setShowYouthGrad]=useState(false);
  const [youthNegTarget,setYouthNegTarget]=useState(null); // 1군승격 연봉협상 대상
  const [showYouthNeg,setShowYouthNeg]=useState(false);
  const [youthNegWage,setYouthNegWage]=useState(0);
  // ── 2D 경기 뷰어 ──
  const [show2DMatch,setShow2DMatch]=useState(false);
  const [match2DData,setMatch2DData]=useState(null); // {homeSq, awaySq, homeTeam, awayTeam, events, formation}
  const [match2DSpeed,setMatch2DSpeed]=useState(1); // 1|2|4
  const [matchViewMode,setMatchViewMode]=useState("2d"); // "2d" | "skip"
  const [match2DPaused,setMatch2DPaused]=useState(false); // [{player, type, demandWage, bonusTrophy, reason}]
  const [ratingTarget,setRatingTarget]=useState(null);
  const [ballonDorHistory,setBallonDorHistory]=useState([]); // [{season, player, myPlayer}]
  // ─── 저장 / 불러오기 ───────────────────────────────────────────────────────
  const SAVE_KEY="fm_save_v1";
  const [showSaveModal,setShowSaveModal]=useState(false);
  const [saveSlots,setSaveSlots]=useState(()=>{try{return JSON.parse(localStorage.getItem(SAVE_KEY)||"[]");}catch{return [];}});
  const [saveSlotName,setSaveSlotName]=useState("");

  function buildSaveData(slotName){
    return {
      slotName:slotName||`S${season} ${selTeam?.name||""} ${new Date().toLocaleDateString("ko-KR")}`,
      savedAt:Date.now(),
      // 게임 진행 상태
      screen,selLeague,selTeam,budget,budgetBase,week,season,pts,fanApproval,
      squad,injured,injuryMatches,youthSquad,tLog,fakeUsed,news,matchLog,
      table,matchRes,matchPhase,formation,lineupSlots,
      cupProgress,wonTrophies,permBudgetBonus,permWageBonus,
      seasonFinished,seasonSummary,
      playerRatings,playerConditions,
      hijackedPlayers:Array.from(hijackedPlayers),
      retiredLegends,ballonDorHistory,
      difficulty,
      pendingSales,playerMorale,facilityLevels,boardObjective,sponsorContract,installmentDeals,loanPlayers,loanOutPlayers,preContractPlayers,
      consecutiveGames,mentoringPairs,setpieceLevel,teamChemistry,
    };
  }
  function saveGame(slotIdx){
    const name=saveSlotName.trim()||`S${season} ${selTeam?.name||""} ${new Date().toLocaleDateString("ko-KR")}`;
    const data=buildSaveData(name);
    const newSlots=[...saveSlots];
    if(slotIdx!=null&&slotIdx>=0&&slotIdx<newSlots.length){
      newSlots[slotIdx]=data; // 덮어쓰기
    }else{
      if(newSlots.length>=5)newSlots.shift(); // 최대 5슬롯
      newSlots.push(data);
    }
    localStorage.setItem(SAVE_KEY,JSON.stringify(newSlots));
    setSaveSlots(newSlots);
    setSaveSlotName("");
    notify("💾 게임이 저장되었습니다!","success");
    setShowSaveModal(false);
  }
  function loadGame(slot){
    if(!slot)return;
    try{
      setScreen(slot.screen||"game");
      setSelLeague(slot.selLeague);setSelTeam(slot.selTeam);
      setBudget(slot.budget);setBudgetBase(slot.budgetBase);
      setWeek(slot.week);setSeason(slot.season);setPts(slot.pts);
      setFanApproval(slot.fanApproval);setSquad(slot.squad||[]);
      setInjured(slot.injured||[]);setInjuryMatches(slot.injuryMatches||{});
      setYouthSquad(slot.youthSquad||[]);setTLog(slot.tLog||[]);
      setFakeUsed(!!slot.fakeUsed);setNews(slot.news||[]);setMatchLog(slot.matchLog||[]);
      setTable(slot.table||[]);setMatchRes(slot.matchRes||null);
      setMatchPhase(slot.matchPhase||null);
      setFormation(slot.formation||"4-3-3");setLineupSlots(slot.lineupSlots||{});
      setCupProgress(slot.cupProgress||{});setWonTrophies(slot.wonTrophies||[]);
      setPermBudgetBonus(slot.permBudgetBonus||0);setPermWageBonus(slot.permWageBonus||0)
      setSeasonFinished(!!slot.seasonFinished);setSeasonSummary(slot.seasonSummary||null);
      setPlayerRatings(slot.playerRatings||{});
      setPlayerConditions(slot.playerConditions||{});
      setHijackedPlayers(new Set(slot.hijackedPlayers||[]));
      setRetiredLegends(slot.retiredLegends||[]);
      setBallonDorHistory(slot.ballonDorHistory||[]);
      setDifficulty(slot.difficulty||"일반");
      setPendingSales(slot.pendingSales||[]);
      setPlayerMorale(slot.playerMorale||{});
      setFacilityLevels(slot.facilityLevels||{training:1,medical:1,scout:1,stadium:1});
      setBoardObjective(slot.boardObjective||null);
      setSponsorContract(slot.sponsorContract||null);
      setInstallmentDeals(slot.installmentDeals||[]);
      setLoanPlayers(slot.loanPlayers||[]);
      setLoanOutPlayers(slot.loanOutPlayers||[]);
      setPreContractPlayers(slot.preContractPlayers||[]);
      setConsecutiveGames(slot.consecutiveGames||{});
      setMentoringPairs(slot.mentoringPairs||[]);
      setSetpieceLevel(slot.setpieceLevel||0);
      setTeamChemistry(slot.teamChemistry||70);
      setTab("오버뷰");setShowSaveModal(false);
      notify("📂 게임을 불러왔습니다!","success");
    }catch(e){notify("불러오기 실패: 저장 데이터가 손상되었습니다","error");}
  }
  function deleteSaveSlot(idx){
    const newSlots=saveSlots.filter((_,i)=>i!==idx);
    localStorage.setItem(SAVE_KEY,JSON.stringify(newSlots));
    setSaveSlots(newSlots);
  }
  // ─────────────────────────────────────────────────────────────────────────────
  function notify(msg,type="info"){setNotif({msg,type});setTimeout(()=>setNotif(null),3500);}
  function addNews(msg,type="info"){setNews(prev=>[{id:Date.now()+Math.random(),msg,type,week,season},...prev].slice(0,100));}
  function startGame(teamId){
    const lEntry=Object.entries(LEAGUES).find(([,l])=>l.teams.find(t=>t.id===teamId));
    if(!lEntry)return;
    const team=lEntry[1].teams.find(t=>t.id===teamId);
    setSelLeague(lEntry[0]);setSelTeam(team);
    const diffMult={입문:1.4,일반:1.0,하드:0.75,리얼리스틱:0.6}[difficulty]||1.0;
    const initBudget=Math.round(team.budget*15*diffMult);
    setBudget(initBudget);setBudgetBase(initBudget);
    const sq=buildSquad(teamId);
    setSquad(sq);
    // 기본 선발 설정 (포메이션 자동 배치)
    setFormation("4-3-3");
    setLineupSlots(autoAssignFormation("4-3-3",sq,[],{}));
    const t=lEntry[1].teams.map(t=>({id:t.id,name:t.name,p:0,w:0,d:0,l:0,gf:0,ga:0,pts:0}));
    setTable(t);
    const cups={};Object.keys(CUPS).forEach(cid=>{cups[cid]={round:1,active:true};});
    setCupProgress(cups);
    setWonTrophies([]);setPermBudgetBonus(0);setPermWageBonus(0);
    setPts(0);setWeek(1);setSeason(1);setFanApproval(72);
    setInjured([]);setInjuryMatches({});setTLog([]);setFakeUsed(false);setNews([]);setMatchLog([]);
    setSeasonFinished(false);setSeasonSummary(null);setShowSeasonEnd(false);
    // 선수 초기 컨디션 설정 — 리그 시작 시 전원 100%
    const initConds={};
    sq.forEach(p=>{initConds[p.id]=100;});
    setPlayerConditions(initConds);
    setHijackedPlayers(new Set());
    setPlayerRatings({});
    setYouthSquad(ALL_YOUTH_PLAYERS.filter(p=>p.club===teamId).map(p=>({...p})));
    addNews(`⚽ ${team.name} 2026-27 시즌 시작! 예산 ${fmt(initBudget)}`,"system");
    setScreen("game");
  }
  function getStarting(){
    const available=squad.filter(p=>!injured.includes(p.id));
    if(lineup.length>=11){
      const valid=lineup.map(id=>available.find(p=>p.id===id)).filter(Boolean);
      if(valid.length>=11)return valid.slice(0,11);
    }
    return available.slice(0,11);
  }
  // 선발 명단에 골키퍼가 최소 1명 포함되어 있는지 확인
  function startingHasGK(){
    return getStarting().some(p=>p.pos==="GK");
  }
  function simulateMatch(hSq,aSq,hTeam,aTeam,cupMode=false){
    // ── 팀 강도 계산: 선수 평균 OVR + prestige 보정 ──
    const hRat=hSq.reduce((s,p)=>s+p.rat,0)/hSq.length;
    const aRat=aSq.reduce((s,p)=>s+p.rat,0)/aSq.length;
    const hPres=hTeam?.prestige||6;
    const aPres=aTeam?.prestige||6;
    // prestige 1단계 차이당 ±2.5점 보정 — 난이도 대폭 강화
    // 팀 케미스트리 보너스 (최대 +3)
    const chemBonus=hTeam?.id===selTeam?.id?(teamChemistry-70)*0.05:0;
    // 세트피스 보너스 (레벨당 공격+0.4, 수비-0.2)
    const spAttBonus=hTeam?.id===selTeam?.id?setpieceLevel*0.4:0;
    const spDefPenalty=aTeam?.id===selTeam?.id?setpieceLevel*0.2:0;
    // 시설 훈련 보너스 (훈련 시설 Lv당 +0.5)
    const facilityBonus=hTeam?.id===selTeam?.id?(facilityLevels.training-1)*0.5:0;
    const hStr=(hRat + (hPres-6)*2.5 + 1.0 + chemBonus + spAttBonus + facilityBonus);
    const aStr=(aRat + (aPres-6)*2.5 + spDefPenalty);
    // 평균 능력치 비교 → 높은 팀 승리확률 60% 강화 (기존 40%)
    const ratBoost=hRat>aRat?1.6:aRat>hRat?1/1.6:1.0;
    const hStrAdj=hStr*(hRat>aRat?ratBoost:1.0);
    const aStrAdj=aStr*(aRat>hRat?ratBoost:1.0);
    const total=hStrAdj+aStrAdj;
    const events=[];let hg=0,ag=0;
    const contrib={};
    hSq.concat(aSq).forEach(p=>{
      const cond=(playerConditions[p.id]||100)/100;
      const ps=calcPosStat(p,cond);
      contrib[p.id]={name:p.name,goals:0,assists:0,shots:0,rating:ps.baseRating,home:hSq.includes(p),passAcc:ps.passAcc,interceptions:ps.interceptions};
    });
    for(let min=5;min<=95;min+=Math.floor(Math.random()*10)+4){
      if(Math.random()<0.26){
        // 골 확률 상승 + 강팀 편향 강화 → 무승부 감소
        const rawRatio=hStrAdj/total;
        const exaggerated=rawRatio>0.5?Math.min(0.94,rawRatio+(rawRatio-0.5)*1.5):Math.max(0.06,rawRatio-(0.5-rawRatio)*1.5);
        const homeShot=Math.random()<exaggerated;
        const atkSq=homeShot?hSq:aSq;
        const scorer=weightedPick(atkSq,"goal");
        if(homeShot)hg++;else ag++;
        if(contrib[scorer.id]){
          contrib[scorer.id].goals++;contrib[scorer.id].shots++;
          const gPos=scorer.pos||"CM";
          const gBonus=["GK","CB"].includes(gPos)?1.4:["LB","RB","CDM"].includes(gPos)?1.0:["CM","CAM"].includes(gPos)?0.8:0.6;
          contrib[scorer.id].rating=Math.min(10,parseFloat((contrib[scorer.id].rating+gBonus).toFixed(1)));
        }
        events.push({min,type:"goal",player:scorer.name,pid:scorer.id,home:homeShot});
        // 어시스트: 미드/윙 가중 선택
        if(Math.random()<0.65&&atkSq.length>1){
          const assister=weightedPick(atkSq.filter(p=>p.id!==scorer.id),"assist");
          if(assister&&contrib[assister.id]){
            contrib[assister.id].assists++;
            const aPos=assister.pos||"CM";
            const aBonus=["CAM","CM","LW","RW"].includes(aPos)?0.5:0.3;
            contrib[assister.id].rating=Math.min(10,parseFloat((contrib[assister.id].rating+aBonus).toFixed(1)));
            events.push({min,type:"assist",player:assister.name,scorer:scorer.name,home:homeShot});
          }
        }
      }
      // 빅찬스 무산 (골 안된 슈팅 - 텐션용 이벤트)
      if(Math.random()<0.10){
        const pool4=Math.random()<(hStrAdj/total)?hSq:aSq;
        const p4=pool4[Math.floor(Math.random()*pool4.length)];
        const home4=pool4===hSq;
        events.push({min,type:"chance",player:p4.name,home:home4});
      }
      // GK 선방
      if(Math.random()<0.08){
        const defPool=Math.random()<0.5?hSq:aSq;
        const gk=defPool.find(p=>p.pos==="GK");
        if(gk){
          // 실점 중인 경우 GK 선방은 더 가치 있음
          const gkTeamGoals=defPool===hSq?hg:ag;
          const oppGoals=defPool===hSq?ag:hg;
          const saveBonus=oppGoals>gkTeamGoals?0.8:0.55;
          if(contrib[gk.id])contrib[gk.id].rating=Math.min(10,parseFloat((contrib[gk.id].rating+saveBonus).toFixed(1)));
          events.push({min,type:"save",player:gk.name,home:defPool===hSq});
        }
      }
      if(Math.random()<0.07){
        const homePool=Math.random()<0.55;
        const pool2=homePool?hSq:aSq;
        const p2=pool2[Math.floor(Math.random()*pool2.length)];
        if(Math.random()*100<p2.inj*7){
          const inj=INJTYPES[Math.floor(Math.random()*INJTYPES.length)];
          if(contrib[p2.id])contrib[p2.id].rating=Math.max(1,parseFloat((contrib[p2.id].rating-2.5).toFixed(1)));
          events.push({min,type:"injury",player:p2.name,detail:inj.t,duration:inj.d,pid:p2.id,home:homePool});
        }
      }
      if(Math.random()<0.09){
        const pool3=Math.random()<0.5?hSq:aSq;
        const p3=pool3[Math.floor(Math.random()*pool3.length)];
        if(contrib[p3.id])contrib[p3.id].rating=Math.max(1,parseFloat((contrib[p3.id].rating-0.8).toFixed(1)));
        events.push({min,type:"yellow",player:p3.name,home:pool3===hSq});
      }
      // 레드카드 (희귀, 옐로 누적 가정)
      if(Math.random()<0.012){
        const pool5=Math.random()<0.5?hSq:aSq;
        const p5=pool5[Math.floor(Math.random()*pool5.length)];
        if(contrib[p5.id])contrib[p5.id].rating=Math.max(1,parseFloat((contrib[p5.id].rating-3).toFixed(1)));
        events.push({min,type:"red",player:p5.name,home:pool5===hSq});
      }
    }
    // ── 컵 모드: 동점이면 연장+승부차기 ──
    let penalty=false;
    if(cupMode && hg===ag){
      for(let min=96;min<=120;min+=Math.floor(Math.random()*8)+4){
        if(Math.random()<0.15){
          const homeShot=Math.random()<hStrAdj/total;
          const pool=homeShot?hSq:aSq;
          const scorer=pool[Math.floor(Math.random()*pool.length)];
          if(homeShot)hg++;else ag++;
          if(contrib[scorer.id])contrib[scorer.id].goals++;
          events.push({min,type:"goal",player:scorer.name,pid:scorer.id,home:homeShot});
        }
      }
      if(hg===ag){
        penalty=true;
        const homeWinPk=Math.random()<(hStrAdj/total);
        if(homeWinPk)hg++;else ag++;
        events.push({min:120,type:"penalty",home:homeWinPk,player:homeWinPk?"홈팀":"원정팀"});
      }
    }
    const homePlayers=hSq.map(p=>contrib[p.id]).filter(Boolean);
    const mvp=homePlayers.sort((a,b)=>(b.goals*30+b.assists*15+b.rating)-(a.goals*30+a.assists*15+a.rating))[0];
    // 경기 통계: 점유율(전력비례), 슈팅수(이벤트 기반)
    const possession=Math.round((hStrAdj/total)*100);
    const hShots=events.filter(e=>(e.type==="goal"||e.type==="chance"||e.type==="save")&&e.home).length;
    const aShots=events.filter(e=>(e.type==="goal"||e.type==="chance"||e.type==="save")&&!e.home).length;
    const stats={possession,hShots:Math.max(hShots,hg),aShots:Math.max(aShots,ag)};
    return{hg,ag,events,contrib,mvp,penalty,stats};
  }
  function buildMatchLog(res,homeTeam,awayTeam,cupMode=false){
    const logs=[];
    logs.push(`⚽ ${homeTeam.name} vs ${awayTeam.name} — 킥오프!`);
    logs.push(`📋 선발 포메이션: ${formation}`);
    if(res.stats)logs.push(`📊 예상 점유율 — ${homeTeam.name} ${res.stats.possession}% : ${100-res.stats.possession}% ${awayTeam.name}`);
    const sorted=[...res.events].sort((a,b)=>a.min-b.min);
    let inExtra=false;
    let halfShown=false;
    sorted.forEach(e=>{
      if(!halfShown&&e.min>=45){halfShown=true;logs.push(`⏸ 전반 종료 — ${homeTeam.name} ${res.events.filter(ev=>ev.type==="goal"&&ev.min<45&&ev.home).length} : ${res.events.filter(ev=>ev.type==="goal"&&ev.min<45&&!ev.home).length} ${awayTeam.name}`);}
      if(cupMode && e.min>=96 && !inExtra){
        inExtra=true;
        logs.push(`⏱ 90분 — 정규 시간 종료! 동점! 연장전 돌입!`);
      }
      if(e.type==="goal"){
        const team=e.home?homeTeam.name:awayTeam.name;
        const label=e.min>=120?"🥅 승부차기":e.min>=96?"⚡ 연장골":"⚽";
        logs.push(`${label} ${e.min}분 — ${e.player} 골! (${team}) 🎉`);
      }else if(e.type==="penalty"){
        const winner=e.home?homeTeam.name:awayTeam.name;
        logs.push(`🥅 승부차기 — ${winner} 승리!`);
      }else if(e.type==="injury"){
        logs.push(`🩹 ${e.min}분 — ${e.player} 부상! (${e.detail}, 예상 결장 ${e.duration}경기)`);
      }else if(e.type==="yellow"){
        logs.push(`🟨 ${e.min}분 — ${e.player} 경고`);
      }else if(e.type==="red"){
        logs.push(`🟥 ${e.min}분 — ${e.player} 퇴장! (${e.home?homeTeam.name:awayTeam.name} 10인 체제)`);
      }else if(e.type==="assist"){
        logs.push(`🎯 ${e.min}분 — ${e.player} 어시스트! (→ ${e.scorer} 득점 도움)`);
      }else if(e.type==="save"){
        logs.push(`🧤 ${e.min}분 — ${e.player} 환상적인 선방!`);
      }else if(e.type==="chance"){
        logs.push(`💨 ${e.min}분 — ${e.player} 결정적 기회! 아쉽게 빗나감`);
      }
    });
    const suffix=res.penalty?"(연장/승부차기)":"";
    logs.push(`⏱ 경기 종료 ${suffix} — 최종: ${homeTeam.name} ${res.hg} - ${res.ag} ${awayTeam.name}`);
    if(res.stats)logs.push(`📊 슈팅 — ${homeTeam.name} ${res.stats.hShots} : ${res.stats.aShots} ${awayTeam.name}`);
    if(res.mvp){
      const comment=MVP_COMMENTS[Math.floor(Math.random()*MVP_COMMENTS.length)];
      logs.push(`🏅 오늘의 MVP: ${res.mvp.name} (평점 ${res.mvp.rating}/10) — ${comment}`);
    }
    return logs;
  }
  // 경기 결과 반영 공통 함수
  function applyMatchResult(res, opp, logs){
    setMatchLog(logs);
    setMatchRes({...res,home:selTeam,away:opp,week});
    const newInjEvents=res.events.filter(e=>e.type==="injury"&&e.home&&e.pid&&!injured.includes(e.pid));
    const newInj=newInjEvents.map(e=>e.pid);
    if(newInj.length>0){
      setInjured(prev=>[...prev,...newInj]);
      setInjuryMatches(prev=>{
        const next={...prev};
        newInjEvents.forEach(e=>{next[e.pid]=e.duration;});
        return next;
      });
      newInjEvents.forEach(e=>{const p=squad.find(s=>s.id===e.pid);if(p)addNews(`🩹 ${p.name} 부상 이탈! (${e.detail}, 약 ${e.duration}경기 결장)`,"injury");});
    }
    // 기존 부상 선수 결장 경기수 차감 → 0이 되면 복귀
    setInjuryMatches(prev=>{
      const next={...prev};
      const recovered=[];
      Object.keys(next).forEach(pid=>{
        if(newInj.includes(pid))return; // 이번에 새로 부상당한 선수는 차감 제외
        next[pid]=next[pid]-1;
        if(next[pid]<=0){recovered.push(pid);delete next[pid];}
      });
      if(recovered.length>0){
        setInjured(prevInj=>prevInj.filter(id=>!recovered.includes(id)));
        recovered.forEach(id=>{const p=squad.find(s=>s.id===id);if(p)addNews(`✅ ${p.name} 부상 회복! 복귀 가능`,"injury");});
      }
      return next;
    });
    const won=res.hg>res.ag,draw=res.hg===res.ag;
    const ep=won?3:draw?1:0;
    setPts(prev=>prev+ep);
    if(!won&&!draw){
      setFanApproval(prev=>Math.max(0,prev-3));
      if(selTeam.rivals?.includes(opp.id)){
        setFanApproval(prev=>Math.max(0,prev-8));
        addNews(`😡 라이벌 ${opp.name}에 패배! 팬들 격분!`,"fan");
        notify("라이벌 패배! 팬 지지도 급락","error");
      }
    }else if(won)setFanApproval(prev=>Math.min(100,prev+2));
    setTable(prev=>prev.map(row=>{
      if(row.id!==selTeam.id)return row;
      return{...row,p:row.p+1,w:row.w+(won?1:0),d:row.d+(draw?1:0),l:row.l+(!won&&!draw?1:0),gf:row.gf+res.hg,ga:row.ga+res.ag,pts:row.pts+ep};
    }));
    const newWeek=week+1;
    setWeek(newWeek);
    addNews(`⚽ ${selTeam.name} ${res.hg}-${res.ag} ${opp.name}`,"match");
    if(res.mvp)addNews(`🏅 MVP: ${res.mvp.name} (평점 ${res.mvp.rating}/10)`,"match");
    // 선수별 평점 누적
    if(res.contrib){
      setPlayerRatings(prev=>{
        const next={...prev};
        const starting2=getStarting();
        starting2.forEach(p=>{
          const c=res.contrib[p.id];
          if(c){
            const cur=next[p.id]||{total:0,count:0,avg:0,goals:0,assists:0,shots:0,passAccTotal:0,intercTotal:0};
            const newTotal=cur.total+c.rating;
            const newCount=cur.count+1;
            next[p.id]={total:newTotal,count:newCount,avg:Math.round((newTotal/newCount)*10),
              goals:(cur.goals||0)+c.goals,assists:(cur.assists||0)+c.assists,
              shots:(cur.shots||0)+(c.shots||0),
              passAccTotal:(cur.passAccTotal||0)+(c.passAcc||0),
              intercTotal:(cur.intercTotal||0)+(c.interceptions||0)};
          }
        });
        return next;
      });
      // 선수 시즌 골/어시 누적
      setSquad(prev=>prev.map(p=>{
        const c=res.contrib[p.id];
        if(!c)return p;
        return{...p,goals:(p.goals||0)+c.goals,ast:(p.ast||0)+c.assists};
      }));
    }
    if(week%4===0){checkFreeAgents();checkMoraleEvents();}
    // ── 연속출전 피로 카운터 업데이트 ──
    const startingNow=new Set(getStarting().map(p=>p.id));
    setConsecutiveGames(prev=>{
      const next={...prev};
      squad.forEach(p=>{
        if(startingNow.has(p.id)){next[p.id]=(next[p.id]||0)+1;}
        else{next[p.id]=0;}
      });
      return next;
    });
    // ── 3연속 선발 시 컨디션 추가 하락 ──
    setPlayerConditions(prev=>{
      const next={...prev};
      startingNow.forEach(id=>{
        const consec=(consecutiveGames[id]||0)+1;
        if(consec>=3){next[id]=Math.max(15,(next[id]??80)-12);}
      });
      return next;
    });
    // ── 모럴 업데이트: 연속 벤치 선수 불만 ──
    setPlayerMorale(prev=>{
      const next={...prev};
      squad.forEach(p=>{
        if(startingNow.has(p.id)){next[p.id]=Math.min(100,(next[p.id]||70)+3);}
        else{
          const consec=consecutiveGames[p.id]||0;
          if(consec===0){next[p.id]=Math.max(20,(next[p.id]||70)-(consec>=3?8:consec>=2?4:1));}
        }
      });
      return next;
    });
    // ── 팀 케미스트리 계산 ──
    const starting=getStarting();
    const natCounts={};starting.forEach(p=>{natCounts[p.nat]=(natCounts[p.nat]||0)+1;});
    const sameNatBonus=Object.values(natCounts).filter(c=>c>=2).length*3;
    const avgAge=starting.length>0?starting.reduce((s,p)=>s+p.age,0)/starting.length:25;
    const ageBonus=avgAge>=25&&avgAge<=29?8:avgAge>=23&&avgAge<=31?4:0;
    const foreignPct=starting.filter(p=>!isKoreanNat(p.nat)).length/Math.max(1,starting.length);
    const foreignPenalty=foreignPct>0.9?-5:0;
    setTeamChemistry(prev=>Math.min(100,Math.max(40,prev*0.85+(sameNatBonus+ageBonus+foreignPenalty)+15)));
    // ── 멘토링 효과: 분기별 유망주 성장 ──
    if(week%9===0&&mentoringPairs.length>0){
      setSquad(prev=>prev.map(p=>{
        const pair=mentoringPairs.find(m=>m.studentId===p.id);
        if(!pair)return p;
        const mentor=prev.find(m=>m.id===pair.mentorId);
        if(!mentor)return p;
        const posBonus=mentor.pos===p.pos?2:1;
        const growthBonus=Math.random()<0.35?posBonus:0;
        if(growthBonus>0){addNews(`📈 멘토링 효과! ${p.name} 성장 (${mentor.name} → ${p.name} +${growthBonus} OVR)`,"system");}
        return growthBonus>0?{...p,rat:Math.min(99,p.rat+growthBonus)}:p;
      }));
    }
    // ── 강등 위기 체크 ──
    {const meRow=table.find(r=>r.id===selTeam?.id);const sorted=[...table].sort((a,b)=>b.pts-a.pts);const myRank=sorted.findIndex(r=>r.id===selTeam?.id)+1;const totalTeams=sorted.length;if(myRank>totalTeams-3&&(meRow?.p||0)>20&&!showRelegationWarning){setShowRelegationWarning(true);}}
    // 이적 시장 등록 선수 오퍼 처리 (등록 후 1주 이상 경과한 건)
    const ripeForSale=pendingSales.filter(s=>s.listedWeek<=week-1);
    if(ripeForSale.length>0){
      const first=ripeForSale[0];
      setTimeout(()=>processPendingSaleOffer(first),300);
    }
    // 경기 후 선발 선수 컨디션 하락 (나이 많을수록 급격히)
    setPlayerConditions(prev=>{
      const next={...prev};
      const startingIds=getStarting().map(p=>p.id);
      startingIds.forEach(id=>{
        const p=squad.find(s=>s.id===id);
        if(!p)return;
        const baseDrop=getConditionDrop(p.age);
        const drop=p.pos==="GK"?Math.round(baseDrop*0.2):baseDrop;
        next[id]=Math.max(28,Math.min(100,(next[id]??80)-drop));
      });
      // 벤치(쉰 선수): 컨디션 +70 회복
      const startingSet=new Set(startingIds);
      squad.forEach(p=>{
        if(!startingSet.has(p.id)&&!injured.includes(p.id)){
          next[p.id]=Math.min(100,(next[p.id]??80)+70);
        }
      });
      return next;
    });
    // AI 팀 경기 시뮬레이션 (2라운드로 경기수 균형)
    simulateAIMatches();
    simulateAIMatches();
    setBudget(prev=>{const b=parseFloat(((fanApproval-50)*0.04).toFixed(1));if(Math.abs(b)>=0.5)addNews(`💰 팬 수익 ${b>=0?"+":""}€${b}M`,"system");return parseFloat((prev+b).toFixed(1));});
    // 시즌 종료 체크 (38경기)
    const meRow=table.find(r=>r.id===selTeam.id);
    const myGames=(meRow?.p||0)+1;
    if(myGames>=SEASON_MATCHES){
      setTimeout(()=>triggerSeasonEnd(newWeek),400);
    }
    setMatchPhase("result");
    setShowMatch(true);
  }
  // ─── 경기 관여: 하프타임 전술 보너스 계산 ───
  // choice: "press"(압박) | "balanced"(균형) | "defensive"(수비)
  // 전반 스코어를 보고 전술을 선택하면 후반 시뮬 강도가 달라짐
  function applyHalfTimeBonus(choice, firstHalfRes, oppStr){
    // 압박: 내 공격력 +15%, 수비 -10%
    // 균형: 보정 없음
    // 수비: 내 수비 +12%, 공격 -8%
    const bonusMap={press:{atkMult:1.15,defMult:0.90},balanced:{atkMult:1.0,defMult:1.0},defensive:{atkMult:0.92,defMult:1.12}};
    return bonusMap[choice]||bonusMap.balanced;
  }
  // ─── 경기 이벤트 선택지: 특정 분에 전술 결정 요청 ───
  // 결과: {type:"press"|"longball"|"defend", bonus}
  const MATCH_EVENT_CHOICES=[
    {id:"press",label:"⚡ 압박 강화",desc:"공격적으로 나선다",atkBonus:0.12,defMalus:-0.08},
    {id:"longball",label:"🎯 롱볼 전환",desc:"빠른 역습을 노린다",atkBonus:0.07,defMalus:0.0},
    {id:"defend",label:"🛡️ 수비 집중",desc:"실점을 막는다",atkBonus:-0.05,defMalus:0.10},
  ];
  // ─── 전반 시뮬 (45분까지) ───
  function simulateFirstHalf(hSq, aSq, hTeam, aTeam){
    const hRat=hSq.reduce((s,p)=>s+p.rat,0)/hSq.length;
    const aRat=aSq.reduce((s,p)=>s+p.rat,0)/aSq.length;
    const hPres=hTeam?.prestige||6;const aPres=aTeam?.prestige||6;
    const hStr=(hRat+(hPres-6)*2.5+1.0);const aStr=(aRat+(aPres-6)*2.5);
    // 평균 능력치 비교 → 높은 팀 승리확률 60% 강화
    const ratBoost=hRat>aRat?1.6:aRat>hRat?1/1.6:1.0;
    const hStrAdj=hStr*(hRat>aRat?ratBoost:1.0);
    const aStrAdj=aStr*(aRat>hRat?ratBoost:1.0);
    const total=hStrAdj+aStrAdj;
    const events=[];let hg=0,ag=0;
    const contrib={};
    hSq.concat(aSq).forEach(p=>{const cond=(playerConditions[p.id]||100)/100;const ps=calcPosStat(p,cond);contrib[p.id]={name:p.name,goals:0,assists:0,shots:0,rating:ps.baseRating,home:hSq.includes(p),passAcc:ps.passAcc,interceptions:ps.interceptions};});
    for(let min=5;min<=44;min+=Math.floor(Math.random()*10)+4){
      if(Math.random()<0.26){
        const rawRatio=hStrAdj/total;
        const exaggerated=rawRatio>0.5?Math.min(0.94,rawRatio+(rawRatio-0.5)*1.5):Math.max(0.06,rawRatio-(0.5-rawRatio)*1.5);
        const homeShot=Math.random()<exaggerated;
        const atkSq=homeShot?hSq:aSq;
        const scorer=weightedPick(atkSq,"goal");
        if(homeShot)hg++;else ag++;
        if(contrib[scorer.id]){contrib[scorer.id].goals++;contrib[scorer.id].shots++;const gPos=scorer.pos||"CM";const gBonus=["GK","CB"].includes(gPos)?1.4:["LB","RB","CDM"].includes(gPos)?1.0:["CM","CAM"].includes(gPos)?0.8:0.6;contrib[scorer.id].rating=Math.min(10,parseFloat((contrib[scorer.id].rating+gBonus).toFixed(1)));}
        events.push({min,type:"goal",player:scorer.name,pid:scorer.id,home:homeShot});
        if(Math.random()<0.65&&atkSq.length>1){const ass=weightedPick(atkSq.filter(p=>p.id!==scorer.id),"assist");if(ass&&contrib[ass.id]){contrib[ass.id].assists++;const aBonus=["CAM","CM","LW","RW"].includes(ass.pos||"")?0.5:0.3;contrib[ass.id].rating=Math.min(10,parseFloat((contrib[ass.id].rating+aBonus).toFixed(1)));events.push({min,type:"assist",player:ass.name,scorer:scorer.name,home:homeShot});}}
      }
      if(Math.random()<0.09){const pool3=Math.random()<0.5?hSq:aSq;const p3=pool3[Math.floor(Math.random()*pool3.length)];if(contrib[p3.id])contrib[p3.id].rating=Math.max(1,parseFloat((contrib[p3.id].rating-0.8).toFixed(1)));events.push({min,type:"yellow",player:p3.name,home:pool3===hSq});}
      if(Math.random()<0.07){const homePool=Math.random()<0.55;const pool2=homePool?hSq:aSq;const p2=pool2[Math.floor(Math.random()*pool2.length)];if(Math.random()*100<p2.inj*7){const inj=INJTYPES[Math.floor(Math.random()*INJTYPES.length)];if(contrib[p2.id])contrib[p2.id].rating=Math.max(1,parseFloat((contrib[p2.id].rating-2.5).toFixed(1)));events.push({min,type:"injury",player:p2.name,detail:inj.t,duration:inj.d,pid:p2.id,home:homePool});}}
      if(Math.random()<0.08){const defPool=Math.random()<0.5?hSq:aSq;const gk=defPool.find(p=>p.pos==="GK");if(gk){if(contrib[gk.id])contrib[gk.id].rating=Math.min(10,parseFloat((contrib[gk.id].rating+0.4).toFixed(1)));events.push({min,type:"save",player:gk.name,home:defPool===hSq});}}
      if(Math.random()<0.10){const pool4=Math.random()<(hStrAdj/total)?hSq:aSq;const p4=pool4[Math.floor(Math.random()*pool4.length)];events.push({min,type:"chance",player:p4.name,home:pool4===hSq});}
    }
    return{hg,ag,events,contrib,hStrAdj,aStrAdj,total};
  }
  // ─── 후반 시뮬 (46분~90분, 전술 보너스 적용) ───
  function simulateSecondHalf(hSq,aSq,hTeam,aTeam,firstHalf,tacBonus,subSquad){
    const activeSq=subSquad||hSq;
    const hRat=activeSq.reduce((s,p)=>s+p.rat,0)/activeSq.length;
    const aRat=aSq.reduce((s,p)=>s+p.rat,0)/aSq.length;
    const hPres=hTeam?.prestige||6;const aPres=aTeam?.prestige||6;
    const baseHStr=(hRat+(hPres-6)*2.5+1.0);const aStr=(aRat+(aPres-6)*2.5);
    const ratBoost=hRat>aRat?1.6:aRat>hRat?1/1.6:1.0;
    const hStr=baseHStr*(tacBonus?.atkMult||1.0)*(hRat>aRat?ratBoost:1.0);
    const total=hStr+(aStr*(tacBonus?.defMult||1.0))*(aRat>hRat?ratBoost:1.0);
    const events=[];let hg=firstHalf.hg,ag=firstHalf.ag;
    const contrib={...firstHalf.contrib};
    activeSq.concat(aSq).forEach(p=>{if(!contrib[p.id]){const cond=(playerConditions[p.id]||100)/100;const ps=calcPosStat(p,cond);contrib[p.id]={name:p.name,goals:0,assists:0,shots:0,rating:ps.baseRating,home:activeSq.includes(p),passAcc:ps.passAcc,interceptions:ps.interceptions};}});
    for(let min=46;min<=95;min+=Math.floor(Math.random()*10)+4){
      if(Math.random()<0.26){
        const rawRatio=hStr/total;const exaggerated=rawRatio>0.5?Math.min(0.94,rawRatio+(rawRatio-0.5)*1.5):Math.max(0.06,rawRatio-(0.5-rawRatio)*1.5);
        const homeShot=Math.random()<exaggerated;const atkSq=homeShot?activeSq:aSq;
        const scorer=weightedPick(atkSq,"goal");
        if(homeShot)hg++;else ag++;
        if(contrib[scorer.id]){contrib[scorer.id].goals++;contrib[scorer.id].shots=contrib[scorer.id].shots||0;contrib[scorer.id].shots++;const gPos=scorer.pos||"CM";const gBonus=["GK","CB"].includes(gPos)?1.4:["LB","RB","CDM"].includes(gPos)?1.0:["CM","CAM"].includes(gPos)?0.8:0.6;contrib[scorer.id].rating=Math.min(10,parseFloat((contrib[scorer.id].rating+gBonus).toFixed(1)));}
        events.push({min,type:"goal",player:scorer.name,pid:scorer.id,home:homeShot});
        if(Math.random()<0.65&&atkSq.length>1){const ass=weightedPick(atkSq.filter(p=>p.id!==scorer.id),"assist");if(ass&&contrib[ass.id]){contrib[ass.id].assists++;const aBonus=["CAM","CM","LW","RW"].includes(ass.pos||"")?0.5:0.3;contrib[ass.id].rating=Math.min(10,parseFloat((contrib[ass.id].rating+aBonus).toFixed(1)));events.push({min,type:"assist",player:ass.name,scorer:scorer.name,home:homeShot});}}
      }
      if(Math.random()<0.09){const pool3=Math.random()<0.5?activeSq:aSq;const p3=pool3[Math.floor(Math.random()*pool3.length)];if(contrib[p3.id])contrib[p3.id].rating=Math.max(1,parseFloat((contrib[p3.id].rating-0.8).toFixed(1)));events.push({min,type:"yellow",player:p3.name,home:pool3===activeSq});}
      if(Math.random()<0.07){const homePool=Math.random()<0.55;const pool2=homePool?activeSq:aSq;const p2=pool2[Math.floor(Math.random()*pool2.length)];if(Math.random()*100<p2.inj*7){const inj=INJTYPES[Math.floor(Math.random()*INJTYPES.length)];if(contrib[p2.id])contrib[p2.id].rating=Math.max(1,parseFloat((contrib[p2.id].rating-2.5).toFixed(1)));events.push({min,type:"injury",player:p2.name,detail:inj.t,duration:inj.d,pid:p2.id,home:homePool});}}
      if(Math.random()<0.08){const defPool=Math.random()<0.5?activeSq:aSq;const gk=defPool.find(p=>p.pos==="GK");if(gk){if(contrib[gk.id])contrib[gk.id].rating=Math.min(10,parseFloat((contrib[gk.id].rating+0.4).toFixed(1)));events.push({min,type:"save",player:gk.name,home:defPool===activeSq});}}
      if(Math.random()<0.10){const pool4=Math.random()<(hStr/total)?activeSq:aSq;const p4=pool4[Math.floor(Math.random()*pool4.length)];events.push({min,type:"chance",player:p4.name,home:pool4===activeSq});}
    }
    const allEvents=[...firstHalf.events,...events];
    const homePlayers=activeSq.map(p=>contrib[p.id]).filter(Boolean);
    const mvp=homePlayers.sort((a,b)=>(b.goals*30+b.assists*15+b.rating)-(a.goals*30+a.assists*15+a.rating))[0];
    const possession=Math.round((hStr/total)*100);
    const hShots=allEvents.filter(e=>(e.type==="goal"||e.type==="chance"||e.type==="save")&&e.home).length;
    const aShots=allEvents.filter(e=>(e.type==="goal"||e.type==="chance"||e.type==="save")&&!e.home).length;
    return{hg,ag,events:allEvents,contrib,mvp,penalty:false,stats:{possession,hShots:Math.max(hShots,hg),aShots:Math.max(aShots,ag)}};
  }



  function playMatch(){
    const opponents=LEAGUES[selLeague].teams.filter(t=>t.id!==selTeam.id);
    const opp=opponents[Math.floor(Math.random()*opponents.length)];
    const oppSq=buildOpponentSquad(opp);
    const starting=getStarting();
    if(starting.length<8){notify("출전 가능한 선수가 부족합니다!","error");return;}
    if(!startingHasGK()){notify("⚠️ 선발 명단에 골키퍼가 없습니다! 선발 명단을 확인하세요.","error");return;}
    // 스킵 모드: 2D 없이 바로 전반 종료 → 하프타임 모달
    if(matchViewMode==="skip"){
      const firstHalf=simulateFirstHalf(starting,oppSq,selTeam,opp);
      setMatchLiveState({firstHalf,starting,oppSq,opp,subSquad:null,tacBonus:null});
      setHalfTimeChoice(null);
      setLiveSubstitution(null);
      setPendingSubs([]);
      setSubSelectStep("out");
      setShowMatch(true);
      setMatchPhase("halftime");
      return;
    }
    // 2D 모드: 뷰어 먼저 열기
    const firstHalf=simulateFirstHalf(starting,oppSq,selTeam,opp);
    setMatchLiveState({firstHalf,starting,oppSq,opp,subSquad:null,tacBonus:null});
    setHalfTimeChoice(null);
    setLiveSubstitution(null);
    setPendingSubs([]);
    setSubSelectStep("out");
    setMatch2DData({homeSq:starting,awaySq:oppSq,homeTeam:selTeam,awayTeam:opp,events:firstHalf.events,formation,half:1,firstHalf});
    setMatch2DSpeed(1);
    setMatch2DPaused(false);
    setShow2DMatch(true);
  }
  function confirmHalfTimeAndPlay(choice, subOverrides){
    const {firstHalf,starting,oppSq,opp}=matchLiveState;
    const tacBonus=applyHalfTimeBonus(choice||"balanced",firstHalf,null);
    // pendingSubs 기반으로 후반 스쿼드 구성
    let activeSq=[...starting];
    (subOverrides||pendingSubs).forEach(({outId,inId})=>{
      const inPlayer=squad.find(p=>p.id===inId);
      if(inPlayer)activeSq=activeSq.map(p=>p.id===outId?inPlayer:p);
    });
    // 후반 시뮬
    const res=simulateSecondHalf(starting,oppSq,selTeam,opp,firstHalf,tacBonus,activeSq);
    // 스킵 모드: 바로 결과 적용
    if(matchViewMode==="skip"){
      setShowMatch(false);
      setMatchPhase(null);
      const logs=buildMatchLog(res,selTeam,opp);
      applyMatchResult(res,opp,logs);
      return;
    }
    // 2D 모드: 하프타임 모달 닫고 2D 뷰어로 후반 시작
    setShowMatch(false);
    setMatchPhase(null);
    setMatch2DData({
      homeSq:activeSq,awaySq:oppSq,homeTeam:selTeam,awayTeam:opp,
      events:res.events,formation,half:2,firstHalf,
      secondHalfRes:res,
    });
    setMatch2DSpeed(1);
    setMatch2DPaused(false);
    setShow2DMatch(true);
  }
  function simulateAIMatches(){
    const league=LEAGUES[selLeague];
    if(!league)return;
    const teams=league.teams.filter(t=>t.id!==selTeam.id);
    // 각 AI팀 쌍을 랜덤으로 매칭해서 경기 시뮬
    const shuffled=[...teams].sort(()=>Math.random()-0.5);
    const matchPairs=[];
    for(let i=0;i<shuffled.length-1;i+=2){
      matchPairs.push([shuffled[i],shuffled[i+1]]);
    }
    setTable(prev=>{
      let next=[...prev];
      matchPairs.forEach(([ht,at])=>{
        // ELO 스타일 승률 계산: prestige 차이가 클수록 강팀 승률이 높아지지만,
        // 우승 경쟁 난이도 완화를 위해 격차의 영향과 무승부 감소율을 줄임
        const diff=(ht.prestige+0.4)-at.prestige; // 0.4 = 홈 어드밴티지
        const homeWinProb=1/(1+Math.pow(10,-diff*0.16));
        const drawProb=0.13*Math.exp(-Math.abs(diff)*0.45); // 무승부 확률 대폭 감소
        const awayWinProb=Math.max(0.02,1-homeWinProb-drawProb);
        const sum=homeWinProb+drawProb+awayWinProb;
        const r=Math.random()*sum;
        let hg=0,ag=0;
        if(r<homeWinProb){
          hg=Math.floor(Math.random()*3)+1;ag=Math.floor(Math.random()*hg);
        }else if(r<homeWinProb+drawProb){
          const g=Math.floor(Math.random()*3);hg=g;ag=g;
        }else{
          ag=Math.floor(Math.random()*3)+1;hg=Math.floor(Math.random()*ag);
        }
        const hw=hg>ag,draw=hg===ag;
        next=next.map(row=>{
          if(row.id===ht.id)return{...row,p:row.p+1,w:row.w+(hw?1:0),d:row.d+(draw?1:0),l:row.l+(!hw&&!draw?1:0),gf:row.gf+hg,ga:row.ga+ag,pts:row.pts+(hw?3:draw?1:0)};
          if(row.id===at.id)return{...row,p:row.p+1,w:row.w+(!hw&&!draw?1:0),d:row.d+(draw?1:0),l:row.l+(hw?1:0),gf:row.gf+ag,ga:row.ga+hg,pts:row.pts+(!hw&&!draw?3:draw?1:0)};
          return row;
        });
      });
      return next;
    });
  }
  function triggerSeasonEnd(finalWeek){
    // ── 구단 시설 유지비 차감 ──
    {const lv=facilityLevels;const maintCost=(lv.training-1)*15+(lv.medical-1)*12+(lv.scout-1)*10+(lv.stadium-1)*20;
    if(maintCost>0){setBudget(prev=>parseFloat((prev-maintCost).toFixed(1)));addNews(`🏗️ 구단 시설 유지비 €${maintCost}M 차감`,"system");}}
    // ── 분할납부 처리 ──
    setInstallmentDeals(prev=>{const rem=[];prev.forEach(deal=>{setBudget(b=>parseFloat((b-deal.perSeason).toFixed(1)));addNews(`💳 ${deal.player} 분할납부 €${deal.perSeason}M`,"transfer");if(deal.remaining-deal.perSeason>0.5)rem.push({...deal,remaining:parseFloat((deal.remaining-deal.perSeason).toFixed(1)),paid:parseFloat((deal.paid+deal.perSeason).toFixed(1))});});return rem;});
    // ── 스폰서 연간 수익 ──
    if(sponsorContract){setBudget(prev=>parseFloat((prev+sponsorContract.annual).toFixed(1)));addNews(`🤝 스폰서 수익 +€${sponsorContract.annual}M (${sponsorContract.name})`,"system");}
    // ── 시즌 평점 기반 선수 val 변동 ──
    setSquad(prev=>prev.map(p=>{
      const pr=playerRatings[p.id];
      if(!pr||pr.count<5)return p;
      const avg=pr.avg/10; // avg는 ×10 스케일 → 실제 평점으로
      const growMult=avg>=7.5?1.05:avg>=7.0?1.02:avg>=6.0?1.0:avg>=5.5?0.98:0.95;
      // 나이 감가: 30세 이상은 추가 감가
      const agePen=p.age>=33?0.96:p.age>=30?0.98:1.0;
      const newVal=parseFloat((p.val*growMult*agePen).toFixed(1));
      return{...p,val:Math.max(0.5,newVal)};
    }));
    // ── 연봉상한선 초과 페널티 체크 ──
    const curSalaryCap=getSalaryCap(selTeam)+permWageBonus;
    const curTotalWage=squad.reduce((s,p)=>s+p.wage,0);
    if(curTotalWage>curSalaryCap){
      const overAmt=parseFloat((curTotalWage-curSalaryCap).toFixed(1));
      // 초과량에 비례한 누진 벌금: 기본 500M + 초과액의 50배
      const fine=parseFloat((500+overAmt*120).toFixed(1));
      setBudget(prev=>parseFloat((prev-fine).toFixed(1)));
      addNews(`🚨 [FFP 위반] 연봉상한선 €${curSalaryCap}M 초과 (총 €${curTotalWage.toFixed(1)}M, +€${overAmt}M)! 누진 벌금 €${fine}M 부과!`,"system");
      // 재정 부족 시 계약해지 창 트리거
      setTimeout(()=>{
        setBudget(cur=>{
          if(cur<0){setShowReleaseModal(true);}
          return cur;
        });
      },600);
    }
    setTable(prev=>{
      const sorted=[...prev].sort((a,b)=>b.pts-a.pts||(b.gf-b.ga)-(a.gf-a.ga));
      const myPos=sorted.findIndex(r=>r.id===selTeam.id)+1;
      const myRow=sorted.find(r=>r.id===selTeam.id)||{pts:0,w:0,d:0,l:0,gf:0,ga:0};
      // 보너스 계산
      let bonusAmt=0,bonusMsg="";
      if(myPos===1){bonusAmt=200;bonusMsg="🏆 리그 우승! 예산 +€200M!";}
      else if(myPos===2){bonusAmt=80;bonusMsg="🥈 리그 준우승! 예산 +€80M!";}
      else if(myPos===3){bonusAmt=50;bonusMsg="🥉 3위 피니시! 예산 +€50M";}
      else if(myPos<=4){bonusAmt=35;bonusMsg="✅ 4위! 예산 +€35M";}
      else if(myPos<=6){bonusAmt=20;bonusMsg="✅ UEL/UECL 진출! 예산 +€20M";}
      else if(myPos>=sorted.length-2){bonusAmt=-30;bonusMsg="⚠️ 강등권! 예산 -€30M 패널티";}
      const leader=sorted[0];
      const myPts=myRow.pts;
      const leaderPts=leader?.pts||0;
      let lateBonus=0,lateBonusMsg="";
      if(myPos>1&&leaderPts-myPts<=5&&myPos<=3){lateBonus=40;lateBonusMsg="🔥 시즌 막판 타이틀 경쟁 보너스! +€40M";}
      setSeasonSummary({myPos,myRow,bonusAmt,bonusMsg,lateBonus,lateBonusMsg,sorted,season});
      // ── 이사회 목표 체크 ──
      if(boardObjective){
        const met=boardObjective.type==="rank"?myPos<=boardObjective.target:boardObjective.type==="cup"?wonTrophies.some(t=>t.season===season):false;
        if(met){setBudget(prev=>parseFloat((prev+boardObjective.bonus).toFixed(1)));addNews(`🎯 이사회 목표 달성! 보너스 +€${boardObjective.bonus}M`,"system");notify(`이사회 목표 달성! +€${boardObjective.bonus}M`,"success");}
        else{const penalty=Math.round(boardObjective.bonus*0.3);setBudget(prev=>parseFloat((prev-penalty).toFixed(1)));addNews(`❌ 이사회 목표 미달성 — 예산 삭감 €${penalty}M`,"system");}
        setBoardObjective(null);
      }
      // ── 사전계약 선수 다음 시즌 합류 ──
      preContractPlayers.filter(pc=>pc.startSeason<=season+1).forEach(pc=>{
        if(squad.length<30){
          const cw=getCappedWage(pc.player.wage,3);
          setSquad(s=>[...s,{...pc.player,wage:cw,club:selTeam.id,contractEndSeason:season+4}]);
          addNews(`✅ ${pc.player.name} 사전계약 합류! (이적료 0)`,"transfer");
        }
      });
      setPreContractPlayers(prev=>prev.filter(pc=>pc.startSeason>season+1));
      setShowSeasonEnd(true);
      setSeasonFinished(true);
      if(bonusAmt!==0){setBudget(b=>b+bonusAmt);}
      if(lateBonus>0){setBudget(b=>b+lateBonus);}
      if(bonusMsg)addNews(bonusMsg,"trophy");
      if(lateBonusMsg)addNews(lateBonusMsg,"trophy");
      // ─── 발롱도르 계산 ───
      // 내 팀 선수 + 전체 리그 상위권 선수 풀에서 점수 산정
      // 점수: 골×3 + 도움×2 + 평점×5 + 리그1위팀 소속 보너스 + rat 보정
      const leagueWinnerTeamId=sorted[0]?.id;
      setSquad(prev=>{
        // 내 팀 후보 점수 계산
        const myContenders=prev.map(p=>{
          const pr=playerRatings[p.id];
          const avgRating=pr&&pr.count>0?pr.total/pr.count:6.0;
          const leagueBonus=p.club===leagueWinnerTeamId?8:0;
          const posBonus=(p.pos==="ST"||p.pos==="CF"||p.pos==="LW"||p.pos==="RW")?2:0;
          const score=(p.goals||0)*3+(p.ast||0)*2+avgRating*5+leagueBonus+posBonus+(p.rat-75)*0.3;
          return{...p,_bdScore:score,_bdRating:parseFloat(avgRating.toFixed(2))};
        });
        // 전체 이적 시장 후보 (top fame 선수들 — 실제 경기 데이터 없으므로 rat+fame 기반 추정)
        const globalContenders=ALL_PLAYERS.filter(p=>p.fame>=88&&p.rat>=86&&p.club&&p.club!==selTeam.id)
          .map(p=>{
            const leagueBonus=p.club===leagueWinnerTeamId?8:0;
            const posBonus=(p.pos==="ST"||p.pos==="CF"||p.pos==="LW"||p.pos==="RW")?2:0;
            // 전체선수는 실제 stats 없으므로 rat+fame 기반 추정 점수
            const estGoals=p.pos==="GK"?0:p.pos==="CB"?1:p.pos==="ST"||p.pos==="CF"?Math.floor(p.rat*0.25):Math.floor(p.rat*0.12);
            const estAst=p.pos==="GK"?0:Math.floor(p.rat*0.08);
            const score=estGoals*3+estAst*2+6.5*5+leagueBonus+posBonus+(p.rat-75)*0.3+(p.fame-88)*0.2;
            return{id:p.id,name:p.name,pos:p.pos,rat:p.rat,val:p.val,fame:p.fame,club:p.club,_bdScore:score,_bdRating:6.5,_isGlobal:true};
          });
        // 합쳐서 최고 점수 선수 = 발롱도르
        const allContenders=[...myContenders,...globalContenders].sort((a,b)=>b._bdScore-a._bdScore);
        const winner=allContenders[0];
        const top5=allContenders.slice(0,5);
        const isMyPlayer=myContenders.some(p=>p.id===winner?.id);
        // 내 팀 선수가 수상하면 val·fame 급등 처리
        const boostedSquad=prev.map(p=>{
          if(p.id===winner?.id){
            const newVal=parseFloat((p.val*2.2).toFixed(1)); // 가치 +120%
            const newFame=Math.min(100,p.fame+8);
            return{...p,val:newVal,fame:newFame,ballonDor:(p.ballonDor||0)+1};
          }
          return p;
        });
        setBallonDorHistory(prev2=>[...prev2,{season,winner,top5,isMyPlayer}]);
        addNews(`🏅 ${season}시즌 발롱도르: ${winner?.name} (${winner?.pos}·${winner?.rat})${isMyPlayer?" — 우리 팀 선수!":""}`, "trophy");
        if(isMyPlayer) addNews(`📈 ${winner.name} 시장가치 급등! ${fmt(winner.val*15)} → ${fmt(winner.val*2.2*15)} (발롱도르 효과)`,"trophy");
        return boostedSquad;
      });
      return prev;
    });
  }
  // 컵 대회 출전 자격 체크
  function checkCupQualification(cupId){
    const cup=CUPS[cupId];
    if(!cup.qualifyRank)return{ok:true}; // 제한 없음
    const myGames=sortedTable.find(r=>r.id===selTeam?.id)?.p||0;
    if(myGames<cup.qualifyMinGames)return{ok:true,pending:true,msg:`리그 ${cup.qualifyMinGames}경기 이후 순위 조건 판정 (현재 ${myGames}경기)`};
    if(myPos>cup.qualifyRank)return{ok:false,msg:`현재 순위 ${myPos}위 — ${cup.qualifyDesc} 조건 미충족`};
    return{ok:true};
  }
  function playCupMatch(cupId){
    const cup=CUPS[cupId];const cp=cupProgress[cupId];
    if(!cp||!cp.active){notify("이미 탈락했거나 우승한 대회입니다","error");return;}
    // 출전 자격 체크 (이미 진행 중인 라운드는 체크 면제 — 첫 경기만 체크)
    if(cp.round===1){
      const qual=checkCupQualification(cupId);
      if(!qual.ok){notify(`🚫 ${cup.short} 출전 불가! ${qual.msg}`,"error");return;}
    }
    const starting=getStarting();
    if(starting.length<8){notify("출전 가능한 선수가 부족합니다!","error");return;}
    if(!startingHasGK()){notify("⚠️ 선발 명단에 골키퍼가 없습니다! 선발 명단을 확인하세요.","error");return;}
    // 라운드별 상대 강도: 후반 라운드일수록 강팀 등장
    const minPres=Math.max(4,cp.round*1.5)|0;
    const oppPool=ALL_TEAMS.filter(t=>t.id!==selTeam.id&&t.prestige>=minPres);
    const opp=oppPool[Math.floor(Math.random()*oppPool.length)]||ALL_TEAMS.filter(t=>t.id!==selTeam.id)[0];
    const oppSq=buildOpponentSquad(opp);
    const res=simulateMatch(starting,oppSq,selTeam,opp,true);
    const logs=buildMatchLog(res,selTeam,opp,true);
    setMatchLog(logs);
    setMatchRes({...res,home:selTeam,away:opp,week,cupName:cup.name,penalty:res.penalty});
    const won=res.hg>res.ag;
    const roundNames=["16강","8강","준결승","결승"];
    const rName=roundNames[Math.min(cp.round-1,3)];
    if(won){
      if(cp.round>=4){
        const bonus=cup.budgetBonus*15;const wBonus=cup.wageBonus;
        setPermWageBonus(prev=>Math.min(10,prev+wBonus));
        setBudget(prev=>prev+bonus)
        setWonTrophies(prev=>[...prev,{id:cupId,name:cup.name,icon:cup.icon,season}]);
        setCupProgress(prev=>({...prev,[cupId]:{...prev[cupId],active:false,won:true}}));
        setFanApproval(prev=>Math.min(100,prev+15));
        addNews(`🏆 ${cup.icon} ${cup.name} 우승! 예산 +${fmt(bonus)}, 연봉한도 +${fmt(wBonus)} 영구 증가!`,"trophy");
        notify(`${cup.name} 우승!`,"success");
      }else{
        setCupProgress(prev=>({...prev,[cupId]:{...prev[cupId],round:prev[cupId].round+1}}));
        // 4강(round==3) 이상 진출 시 예산 보너스
        if(cp.round>=3){
          const advBonus=cup.budgetBonus*4;
          // 결승 진출(round 3 통과 → round 4) 시 연봉한도 소폭 증가
          const advWage=cup.finalWageBonus||0;
          setBudget(prev=>prev+advBonus);
          if(advWage>0){setPermWageBonus(prev=>Math.min(10,prev+advWage));addNews(`💰 ${cup.short} 결승 진출! 예산 +${fmt(advBonus)}, 연봉한도 +${fmt(advWage)} 영구 증가!`,"trophy");}
          else{addNews(`💰 ${cup.short} ${rName} 진출 보너스! 예산 +${fmt(advBonus)}`,"trophy");}
          notify(`${cup.short} ${rName} 진출 보너스 +${fmt(advBonus)}!`,"success");
        }else{
          addNews(`✅ ${cup.short} ${rName} 통과!`,"match");
          notify(`${cup.short} ${rName} 통과!`,"success");
        }
      }
    }else{
      setCupProgress(prev=>({...prev,[cupId]:{...prev[cupId],active:false,won:false}}));
      // 결승 탈락(준우승)도 연봉한도 소폭 보너스
      if(cp.round>=4&&cup.finalWageBonus>0){
        setPermWageBonus(prev=>Math.min(10,prev+cup.finalWageBonus));
        addNews(`🥈 ${cup.short} 준우승! 연봉한도 +${fmt(cup.finalWageBonus)} 영구 증가`,"trophy");
      }else{
        addNews(`❌ ${cup.short} ${rName} 탈락 (${res.hg}-${res.ag})`,"match");
      }
    }
    setWeek(prev=>prev+1);
    setShowMatch(true);
  }
  // ── SNS 갈등 / 라커룸 이벤트 ──
  function checkMoraleEvents(){
    const lowMorale=squad.filter(p=>(playerMorale[p.id]||70)<40&&!injured.includes(p.id));
    lowMorale.forEach(p=>{
      if(Math.random()<0.35){
        const msgs=[
          `😤 ${p.name}, SNS에 출전 기회 부족 불만 토로 — "팀이 날 인정 안 한다"`,
          `📱 ${p.name} 소셜미디어 활동 급증 — 이적 루머 번지기 시작`,
          `🔥 ${p.name} 에이전트, "선수가 새로운 도전을 원한다" 공개 발언`,
        ];
        addNews(msgs[Math.floor(Math.random()*msgs.length)],"drama");
        // 40% 확률로 leave 플래그 전환
        if(Math.random()<0.4){
          setSquad(prev=>prev.map(s=>s.id===p.id?{...s,leave:true}:s));
          notify(`⚠️ ${p.name} 이적 희망 — 사기 저하로 인한 이적 요청`,"error");
        }
      }
    });
    // 높은 사기 보너스
    const highMorale=squad.filter(p=>(playerMorale[p.id]||70)>=90);
    if(highMorale.length>=5&&Math.random()<0.2){
      addNews(`💪 팀 분위기 최고조! ${highMorale.slice(0,3).map(p=>p.name).join(", ")} 등 핵심 선수들 집중력 상승`,"fan");
    }
  }
  function checkFreeAgents(){
    if(selTeam.prestige<8){
      squad.filter(p=>p.rat>=85&&p.fame>80).forEach(p=>{
        if(Math.random()<0.18){
          const dest=ALL_TEAMS.filter(t=>t.prestige>=9&&t.id!==selTeam.id)[Math.floor(Math.random()*3)];
          if(dest){
            setSquad(prev=>prev.filter(s=>s.id!==p.id))
            addNews(`🚪 ${p.name} → ${dest.name} 자유이적 (계약 만료)`,"drama");
            setFanApproval(prev=>Math.max(0,prev-10));
          }
        }
      });
    }
  }
  // ── 영입 최종 확정 (구단거절·선수협상 단계 통과 후 호출) ──
  function finalizeTransfer(player,finalFee,cappedWage,yrs){
    const prevClub=player.club;
    if(prevClub){const idx=ALL_PLAYERS.findIndex(p=>p.id===player.id);if(idx!==-1)ALL_PLAYERS[idx]={...ALL_PLAYERS[idx],club:selTeam.id};const repl=ALL_PLAYERS.find(p=>p.club===''&&p.pos===player.pos&&p.id!==player.id&&Math.abs(p.rat-player.rat)<=8);if(repl){const ri=ALL_PLAYERS.findIndex(p=>p.id===repl.id);if(ri!==-1)ALL_PLAYERS[ri]={...repl,club:prevClub};addNews(`🔄 ${ALL_TEAMS.find(t=>t.id===prevClub)?.name||prevClub}, ${repl.name} 대체 영입`,"transfer");}}
    setSquad(prev=>[...prev,{...player,wage:cappedWage,club:selTeam.id,contractEndSeason:season+yrs}]);
    setTLog(prev=>[...prev,{type:"buy",player:player.name,fee:finalFee,week,season}]);
    setFanApproval(prev=>{
      const fameBonus=player.fame>=95?10:player.fame>=90?7:player.fame>=80?4:player.fame>=70?2:1;
      const next=Math.min(100,prev+fameBonus);
      if(fameBonus>=7)addNews(`🎉 팬들 열광! "${player.name} 영입은 빅사이닝!" (지지도 +${fameBonus})`,"fan");
      return next;
    });
    addNews(`✅ ${player.name} ${fmt(finalFee)} 영입 완료 (계약 ${yrs}년)`,"transfer");
    notify(`${player.name} 영입 성공! (계약 ${yrs}년)`,"success");
    setShowNeg(false);setTTarget(null);setContractYears(3);
    setShowPlayerWageDemand(false);setPlayerWageDemandInfo(null);
    setShowClubReject(false);setClubRejectInfo(null);
  }
  // ── 선수 연봉 카운터오퍼 수락 ──
  function acceptPlayerWageDemand(){
    const{player,finalFee,cappedWage,contractYears:yrs,demandWage}=playerWageDemandInfo;
    const actualWage=demandWage; // 선수 요구 연봉 수락
    const currentWageTotal=squad.reduce((s,p)=>s+p.wage,0);
    const salaryCap=getSalaryCap(selTeam)+permWageBonus;
    if(currentWageTotal+actualWage>salaryCap){
      notify(`⚠️ 연봉상한선 초과! (${fmt(parseFloat((currentWageTotal+actualWage).toFixed(1)))}/${fmt(salaryCap)}) — 시즌 종료 시 벌금 부과!`,"error");
    }
    setBudget(prev=>parseFloat((prev-finalFee).toFixed(1)));
    finalizeTransfer(player,finalFee,actualWage,yrs);
  }
  // ── 선수 연봉 카운터오퍼 거절 (기본 연봉으로 강행) ──
  function rejectPlayerWageDemand(){
    const{player,finalFee,cappedWage,contractYears:yrs}=playerWageDemandInfo;
    const currentWageTotal=squad.reduce((s,p)=>s+p.wage,0);
    const salaryCap=getSalaryCap(selTeam)+permWageBonus;
    if(currentWageTotal+cappedWage>salaryCap){
      notify(`⚠️ 연봉상한선 초과! (${fmt(parseFloat((currentWageTotal+cappedWage).toFixed(1)))}/${fmt(salaryCap)}) — 시즌 종료 시 벌금 부과!`,"error");
    }
    // 선수가 낮은 연봉에 불만 — 50% 확률로 이적 거부
    if(Math.random()<0.5){
      notify(`${player.name}이 연봉 조건을 거절하고 이적을 취소했습니다!`,"error");
      addNews(`❌ ${player.name} 연봉 협상 결렬 — 에이전트 "제시 연봉이 너무 낮다"`, "drama");
      setShowPlayerWageDemand(false);setPlayerWageDemandInfo(null);
      setShowNeg(false);return;
    }
    notify(`${player.name} 연봉 협상 타결 (낮은 연봉 수용)`,"success");
    setBudget(prev=>parseFloat((prev-finalFee).toFixed(1)));
    finalizeTransfer(player,finalFee,cappedWage,yrs);
  }
  function doTransfer(player,offer){
    const diffMult={입문:0.8,일반:1.0,하드:1.2,리얼리스틱:1.45}[difficulty]||1.0;
    if(hijackedPlayers.has(player.id)){
      notify(`${player.name}은 하이재킹으로 영입 불가!`,"error");
      setShowNeg(false);return;
    }
    // ── 계약 기간 거절 판정 (금액 설득 시스템) ──
    const age=player.age||25;
    const fame=player.fame||70;
    const fameMod=fame>=95?-1:fame>=70?0:1;
    const agePreferMax=age>=35?2:age>=32?3:age>=29?4:5;
    const playerWantMax=Math.min(5,agePreferMax+fameMod);
    const marketVal=getMarketVal(player);
    const offerRatio=offer/Math.max(1,marketVal);
    // 이적료 금액에 따라 수용 가능 최대기간 증가
    const moneyBonusYears=offerRatio>=2.0?99:offerRatio>=1.5?3:offerRatio>=1.2?2:offerRatio>=1.0?1:0;
    const effectiveAcceptMax=Math.min(MAX_CONTRACT_YEARS,playerWantMax+moneyBonusYears);
    if(contractYears>effectiveAcceptMax){
      const rejectProb=offerRatio>=2.0?0:Math.min(0.90,0.40+(contractYears-effectiveAcceptMax)*0.12);
      if(Math.random()<rejectProb){
        notify(`${player.name}이 ${contractYears}년 계약을 거부했습니다! (현 금액으론 최대 ${effectiveAcceptMax}년까지 수용)`, "error");
        addNews(`❌ ${player.name} ${contractYears}년 계약 거부 — 에이전트 "이적료를 더 높이면 재협상 가능"`, "drama");
        setShowNeg(false);return;
      }
    }
    // 이적 희망(leave) 선수는 할인, 잔류 선수는 115% 프리미엄
    const bubbleMult=player.bubble?1.35:1.0;
    // ── 이적 선호도 확장 ──
    // 귀향 드림: 선수 nat가 selTeam의 리그와 같은 나라면 20% 할인
    const leagueNatMap={epl:"England",laliga:"Spain",seriea:"Italy",bundesliga:"Germany",ligue1:"France",kleague:"Korea Republic"};
    const teamLeagueNat=leagueNatMap[selLeague]||"";
    const homecomeBonus=player.nat===teamLeagueNat?0.82:1.0;
    // 슈퍼스타(fame95+)는 빅클럽(prestige9+)만 원함
    const bigClubReq=player.fame>=95&&(selTeam?.prestige||5)<9?1.30:1.0;
    // UCL 참가 팀 우대: 상위 4위 팀이면 명성 높은 선수 할인
    const myRankNow=[...table].sort((a,b)=>b.pts-a.pts).findIndex(r=>r.id===selTeam?.id)+1;
    // 약팀 구제 보너스: prestige 6 이하 팀이 fame 80+ 선수 영입 시 5% 할인
    const uclBonus=(selTeam?.prestige||5)<=6&&player.fame>=80?0.95:1.0;
    const leaveMult=(player.leave?0.82:1.15)*homecomeBonus*bigClubReq*uclBonus;
    // 자유계약(FA) 선수는 대폭 할인 (이적료 없이 영입 가능 수준)
    const faMult=player.club===""?0.30:1.0;
    const minFee=getMarketVal(player)*leaveMult*faMult*diffMult*bubbleMult;
    const cappedMinFee=player.isIcon ? Math.min(minFee, 6000) : minFee;
    if(offer<cappedMinFee){notify(`제안 거절! 최소 ${fmt(cappedMinFee)} 필요`,"error");addNews(`❌ ${player.name} 협상 결렬`,"transfer");setShowNeg(false);return;}
    if(offer>budget){notify("예산 초과!","error");return;}
    // ── 🏟️ 원 소속 구단 거절 판정 (자유계약·이적희망 선수 제외) ──
    if(player.club!==""&&!player.leave){
      const clubTeam=ALL_TEAMS.find(t=>t.id===player.club);
      const clubPrestige=clubTeam?.prestige||5;
      // 구단 프레스티지가 높을수록, 제안 금액이 낮을수록 거절 확률 상승
      const rejectBase=clubPrestige>=9?0.45:clubPrestige>=7?0.30:clubPrestige>=5?0.20:0.10;
      const priceBonus=offerRatio>=1.8?-0.25:offerRatio>=1.4?-0.15:offerRatio>=1.1?-0.05:0.10;
      const clubRejectProb=Math.max(0,Math.min(0.75,(rejectBase+priceBonus)*diffMult));
      if(Math.random()<clubRejectProb){
        const buyoutFee=parseFloat((marketVal*1.5*leaveMult*bubbleMult).toFixed(1));
        const cappedBuyout=player.isIcon?Math.min(buyoutFee,6000):buyoutFee;
        addNews(`🚫 ${clubTeam?.name||player.club}, ${player.name} 이적 거부 — "어떤 금액에도 팔 생각 없다"`, "drama");
        setClubRejectInfo({player,offer,buyoutFee:cappedBuyout,contractYears,cappedMinFee});
        setShowClubReject(true);setShowNeg(false);return;
      }
    }
    if(Math.random()<0.18){
      const hj=ALL_TEAMS.filter(t=>t.prestige>=selTeam.prestige-1&&t.id!==selTeam.id).sort(()=>Math.random()-0.5)[0];
      if(hj){
        const hjBid=Math.round(offer*(1+Math.random()*0.25+0.1));
        addNews(`🚨 하이재킹! ${hj.name}이 ${player.name}에 €${hjBid}M 역제안!`,"drama");
        setHijackInfo({player,hijackTeam:hj,minBid:hjBid+1,yourOffer:offer});
        setHijackBid(String(hjBid+1));
        setShowHijackCompete(true);setShowNeg(false);return;
      }
    }
    let finalFee=offer,panicMsg="";
    if(Math.random()<0.22){finalFee=offer*(1+Math.random()*0.25);panicMsg=` (마감패닉 +${fmt(finalFee-offer)})`;}
    if(finalFee>budget){notify("패닉 추가금으로 예산 초과!","error");return;}
    const cappedWage=player.isIcon ? 20 : getCappedWage(player.wage,contractYears);
    // 👑 아이콘 선수 팀 내 3명 제한
    if(player.isIcon){
      const iconCount=squad.filter(s=>s.isIcon).length;
      if(iconCount>=3){notify("👑 아이콘 선수는 팀 내 최대 3명까지만 보유 가능합니다","error");return;}
    }
    // ── 🤝 선수 연봉 카운터오퍼 (자유계약 제외, 명성 높을수록 요구 강도 상승) ──
    if(player.club!==""){
      const demandChance=player.fame>=90?0.75:player.fame>=80?0.55:player.fame>=70?0.35:0.20;
      if(!player.isIcon&&Math.random()<demandChance){
        const demandMult=player.fame>=90?1.35:player.fame>=80?1.22:player.fame>=70?1.12:1.08;
        const demandWage=parseFloat((cappedWage*demandMult).toFixed(1));
        const currentWageTotal=squad.reduce((s,p)=>s+p.wage,0);
        const salaryCap=getSalaryCap(selTeam)+permWageBonus;
        if(currentWageTotal+demandWage>salaryCap){
          // 연봉상한 초과되면 카운터오퍼 스킵 (재정 압박 메시지만)
          notify(`⚠️ 연봉상한선 초과! (${fmt(parseFloat((currentWageTotal+cappedWage).toFixed(1)))}/${fmt(salaryCap)}) — 시즌 종료 시 벌금 부과!`,"error");
        } else {
          setPlayerWageDemandInfo({player,offer,finalFee,contractYears,cappedWage,demandWage,panicMsg});
          setShowPlayerWageDemand(true);
          setBudget(prev=>prev); // 아직 차감 안 함
          return;
        }
      }
    }
    const currentWageTotal=squad.reduce((s,p)=>s+p.wage,0);
    const salaryCap=getSalaryCap(selTeam)+permWageBonus;
    if(currentWageTotal+cappedWage>salaryCap){
      notify(`⚠️ 연봉상한선 초과! (${fmt(parseFloat((currentWageTotal+cappedWage).toFixed(1)))}/${fmt(salaryCap)}) — 시즌 종료 시 벌금 부과!`,"error");
    }
    setBudget(prev=>parseFloat((prev-finalFee).toFixed(1)));
    finalizeTransfer(player,finalFee,cappedWage,contractYears);
  }
  function openSell(p){setSellTarget(p);setSellOffer(Math.round(getMarketVal(p)*0.9));setShowSell(true);setDetail(null);}
  // 이적 시장 등록 (다음주 오퍼 대기) — 즉시 현금화 X
  function listPlayerForSale(p,askFee){
    if(pendingSales.find(s=>s.player.id===p.id)){notify(`${p.name}은 이미 이적 시장에 등록되어 있습니다`,"error");return;}
    setPendingSales(prev=>[...prev,{player:p,askFee,listedWeek:week}]);
    setSquad(prev=>prev.map(s=>s.id===p.id?{...s,leave:true}:s));
    addNews(`📋 ${p.name} 이적 시장 공식 등록 — ${fmt(askFee)} 희망 이적료`,"transfer");
    notify(`${p.name} 이적 시장 등록 완료 — 다음 주에 오퍼가 올 수 있습니다`,"success");
    setShowSell(false);setSellTarget(null);
  }
  // 매각 대기 오퍼 결과 처리 (다음 경기/주 넘길 때 호출)
  function processPendingSaleOffer(pending){
    const{player,askFee}=pending;
    const prestige=selTeam?.prestige||5;
    const priceRatio=askFee/Math.max(1,getMarketVal(player));const priceChanceMod=priceRatio>=1.5?-0.25:priceRatio>=1.2?-0.12:priceRatio>=0.9?0:0.08;
    const saleChance=Math.max(0.10,Math.min(0.92,(player.fame>=85?0.80:player.fame>=70?0.65:player.fame>=55?0.50:0.38)+priceChanceMod));
    const sold=Math.random()<saleChance;
    if(sold){
      const priceMult=0.85+Math.random()*0.30; // 85%~115% of ask
      const actualFee=parseFloat((askFee*priceMult).toFixed(1));
      setBudget(prev=>parseFloat((prev+actualFee).toFixed(1)));
      setSquad(prev=>prev.filter(s=>s.id!==player.id));
      setPendingSales(prev=>prev.filter(s=>s.player.id!==player.id));
      setTLog(prev=>[...prev,{type:"sell",player:player.name,fee:actualFee,week,season}]);
      addNews(`✅ ${player.name} ${fmt(actualFee)} 매각 완료 (구단 간 이적 협상 타결)`,"transfer");
      setSaleResultInfo({player,askFee,sold:true,actualFee});
    } else {
      // 오퍼 없음 — 계속 대기 or 가격 낮춰야
      addNews(`❌ ${player.name} — 이번 주 구단 오퍼 없음. 희망 이적료를 낮추거나 다음 주를 기다리세요`,"drama");
      setSaleResultInfo({player,askFee,sold:false,actualFee:0});
    }
    setShowSaleResult(true);
  }
  // 35세 이상 선수가 직접 은퇴를 선택할 수 있는 기능
  // 은퇴식 모달 오픈: 등급·커리어 기록·헌사 문구를 미리 계산해 모달과 뉴스에서 동일하게 사용
  function openRetireModal(p){
    const isLegend=p.fame>=85||p.rat>=86;
    const isVeteranStar=!isLegend&&(p.fame>=70||p.rat>=80);
    const tier=isLegend?"레전드":isVeteranStar?"베테랑":"일반";
    const careerGoals=(p.careerGoals||0)+(p.goals||0);
    const careerAssists=(p.careerAssists||0)+(p.ast||0);
    const seasonsPlayed=(p.seasonsPlayed||0)+1;
    const approvalChange=isLegend?5:isVeteranStar?2:0;
    setRetireCareerInfo({tier,approvalChange,careerGoals,careerAssists,seasonsPlayed});
    setRetireTribute(buildRetirementTribute(p,tier,careerGoals,careerAssists,seasonsPlayed));
    setRetireTarget(p);
    setShowRetire(true);
  }
  function retirePlayer(p){
    const overrideTier=p._retireTier||null;
    const overrideApproval=p._retireApproval!==undefined?p._retireApproval:null;
    setSquad(prev=>prev.filter(s=>s.id!==p.id));
    setLineupSlots(prev=>{
      const next={...prev};
      Object.keys(next).forEach(k=>{if(next[k]===p.id)delete next[k];});
      return next;
    });
    setInjured(prev=>prev.filter(id=>id!==p.id));
    setInjuryMatches(prev=>{const next={...prev};delete next[p.id];return next;});
    setPlayerConditions(prev=>{const next={...prev};delete next[p.id];return next;});
    const idx=ALL_PLAYERS.findIndex(ap=>ap.id===p.id);
    if(idx!==-1)ALL_PLAYERS.splice(idx,1);
    // ── 은퇴식: 선수의 명성/실력에 따라 다른 특별 이벤트 발생 ──
    const info=retireCareerInfo||{tier:"일반",approvalChange:0,careerGoals:p.goals||0,careerAssists:p.ast||0,seasonsPlayed:(p.seasonsPlayed||0)+1};
    const tier=overrideTier||info.tier;
    const approvalChange=overrideApproval!==null?overrideApproval:info.approvalChange;
    const{careerGoals,careerAssists,seasonsPlayed}=info;
    const tribute=retireTribute||buildRetirementTribute(p,tier,careerGoals,careerAssists,seasonsPlayed);
    const newsIcon=tier==="레전드"?"🎉":tier==="베테랑"?"👏":"👋";
    addNews(`${newsIcon} ${p.name}(${p.age}세, ${p.pos}) — ${tribute}`,tier==="레전드"?"trophy":"system");
    if(approvalChange>0){
      addNews(`📈 ${p.name} 은퇴식의 영향으로 팬 지지도 +${approvalChange}%`,"fan");
      setFanApproval(prev=>Math.min(100,prev+approvalChange));
    }
    if(tier==="레전드")setRetiredLegends(prev=>[{id:p.id,name:p.name,pos:p.pos,age:p.age,nat:p.nat,rat:p.rat,fame:p.fame,goals:careerGoals,ast:careerAssists,seasons:seasonsPlayed,season,tier},...prev]);
    notify(tier==="레전드"?`🏆 ${p.name} 레전드 은퇴식 완료!`:tier==="베테랑"?`👏 ${p.name} 헌정 은퇴식 완료`:`${p.name} 은퇴 처리 완료`,"success");
    setDetail(null);
    setShowRetire(false);setRetireTarget(null);setRetireTribute("");setRetireCareerInfo(null);setRetireTierChoice(null);
  }

  function confirmSell(p,fee){
    if(fee<=0){notify("금액을 입력하세요","error");return;}
    setBudget(prev=>parseFloat((prev+fee).toFixed(1)))
    setSquad(prev=>prev.filter(s=>s.id!==p.id));
    setTLog(prev=>[...prev,{type:"sell",player:p.name,fee,week,season}]);
    addNews(`📤 ${p.name} ${fmt(fee)} 매각 완료`,"transfer");
    notify(`${p.name} ${fmt(fee)} 매각!`,"success");
    setShowSell(false);setSellTarget(null);
  }
  function publishFake(){
    if(!fakePlayer||!fakeTemplate){notify("선수와 유형을 선택하세요","error");return;}
    const teams=[selTeam,...(fakeExtraTeams.length>0?fakeExtraTeams:ALL_TEAMS.sort(()=>Math.random()-0.5).slice(0,2))];
    const headline=fakeTemplate.fn(fakePlayer,teams);
    addNews(headline,"fake");
    addNews(`🗞️ 외신들 후속 보도 — "${fakePlayer.name} 이적 루머 확산 중..."`,"fake");
    // 가짜뉴스 유형별 가격 효과
    const priceEffect={
      interest:1.18,sell:0.88,bid:1.25,medical:1.30,reject:0.92,hijack:1.15
    }[fakeTemplate.id]||1.0;
    if(priceEffect!==1.0){
      const affected=squad.find(p=>p.id===fakePlayer.id)||fakePlayer;
      const dir=priceEffect>1?"+":"";
      const pct=Math.round((priceEffect-1)*100);
      addNews(`💹 [시장반응] ${fakePlayer.name} 몸값 ${dir}${pct}% 변동`,"fake");
      // 시장의 선수 가격 변동 (이 선수가 스쿼드에 있으면)
      setSquad(prev=>prev.map(p=>{
        if(p.id!==fakePlayer.id)return p;
        return{...p,val:parseFloat((p.val*priceEffect).toFixed(1)),bubble:priceEffect>1.1};
      }));
    }
    setFakeUsed(true);setShowFake(false);
    notify("가짜뉴스 유포 완료! 시장 반응 확인하세요","success");
  }
  const sortedTable=useMemo(()=>[...table].sort((a,b)=>b.pts-a.pts||(b.gf-b.ga)-(a.gf-a.ga)),[table]);
  // ── 잠재력 랭크 캐시: 렌더마다 전체 풀 재생성 방지 ──
  const potPool=useMemo(()=>[...ALL_PLAYERS,...ALL_YOUTH_PLAYERS],[]);
  const potInfoCache=useMemo(()=>{
    const cache={};
    potPool.forEach(p=>{if(!cache[p.id])cache[p.id]=getPotRankInfo(p,potPool);});
    return cache;
  },[potPool]);
  const getPotI=p=>potInfoCache[p.id]||getPotRankInfo(p,potPool);
  // ── O(1) 조회 맵 ──
  const teamNameMap=useMemo(()=>{const m={};ALL_TEAMS.forEach(t=>{m[t.id]=t.name;});return m;},[]);
  const squadIdSet=useMemo(()=>new Set(squad.map(p=>p.id)),[squad]);
  const myPos=sortedTable.findIndex(r=>r.id===selTeam?.id)+1;
  // 난이도별 시장가 배수: 입문 ×12, 일반 ×15, 하드 ×18, 리얼리스틱 ×22
  const MARKET_MULT={입문:12,일반:15,하드:18,리얼리스틱:22}[difficulty]||15;
  const getMarketVal=(p)=>parseFloat((p.val*MARKET_MULT).toFixed(1));
  const marketPlayers=useMemo(()=>ALL_PLAYERS.filter(p=>{
    if(!selTeam||p.club===selTeam.id)return false;
    if(isKoreanNat(p.nat))return false; // 한국 선수는 별도 "한국 선수" 칸에서만 표시
    if(searchQ&&!p.name.toLowerCase().includes(searchQ.toLowerCase())&&!(p.nat||"").toLowerCase().includes(searchQ.toLowerCase()))return false;
    if(posFilter!=="all"){
      const groupArr=POS_GROUPS[posFilter];
      if(groupArr){if(!groupArr.includes(p.pos))return false;}
      else if(p.pos!==posFilter)return false;
    }
    if(getMarketVal(p)>maxVal)return false;
    return true;
  }).sort((a,b)=>{
    if(marketSort==="age_asc")return a.age-b.age;
    if(marketSort==="age_desc")return b.age-a.age;
    if(marketSort==="val")return b.val-a.val;
    return b.rat-a.rat; // 기본: 능력치순
  }),[selTeam,searchQ,posFilter,maxVal,marketSort]);
  // ─── 한국 선수 전용 이적시장 칸 ───
  // FA 선수: club="" 이면서 스쿼드에 없는 선수
  const faPlayers=useMemo(()=>ALL_PLAYERS.filter(p=>{
    if(squadIdSet.has(p.id))return false;
    if(p.club!=="")return false;
    return true;
  }).sort((a,b)=>b.rat-a.rat),[squadIdSet]);
  const koreanMarketPlayers=useMemo(()=>ALL_PLAYERS.filter(p=>{
    if(!selTeam||p.club===selTeam.id)return false;
    if(!isKoreanNat(p.nat))return false;
    return true;
  }).sort((a,b)=>b.pot-a.pot),[selTeam]);
  // ─── 선택 화면 ───
  if(screen==="select") return (
    <div style={{fontFamily:"system-ui,-apple-system,sans-serif",minHeight:"100vh",background:C.bg}}>
      {/* 저장/불러오기 모달 (선택 화면에서도) */}
      {showSaveModal&&(
        <div style={MODAL_OVERLAY} onClick={()=>setShowSaveModal(false)}>
          <div style={{...MODAL_BOX,maxWidth:480}} onClick={e=>e.stopPropagation()}>
            <div style={{fontWeight:800,fontSize:17,marginBottom:14,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span>📂 저장 슬롯 불러오기</span>
              <button onClick={()=>setShowSaveModal(false)} style={{background:"none",border:"none",fontSize:18,cursor:"pointer",color:C.textSm}}>✕</button>
            </div>
            {saveSlots.length===0?(
              <div style={{padding:"20px",textAlign:"center",color:C.textSm,fontSize:13}}>저장된 게임이 없습니다.</div>
            ):(
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {[...saveSlots].reverse().map((slot,ri)=>{
                  const realIdx=saveSlots.length-1-ri;
                  const d=new Date(slot.savedAt);
                  const dateStr=`${d.getMonth()+1}/${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2,"0")}`;
                  return(
                    <div key={realIdx} style={{padding:"10px 12px",background:C.surface,border:`1px solid ${C.border}`,borderRadius:10,display:"flex",alignItems:"center",gap:10}}>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontWeight:700,fontSize:13,color:C.text,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{slot.slotName||"저장 슬롯"}</div>
                        <div style={{fontSize:11,color:C.textSm,marginTop:2}}>
                          {slot.selTeam?.name} · S{slot.season} {slot.week}주차 · {LEAGUES[slot.selLeague]?.flag} · {dateStr}
                        </div>
                      </div>
                      <div style={{display:"flex",gap:6,flexShrink:0}}>
                        <button onClick={()=>{if(window.confirm("이 슬롯을 불러올까요?"))loadGame(slot);}} style={{...BTN_PRIMARY,padding:"5px 12px",fontSize:11}}>불러오기</button>
                        <button onClick={()=>{if(window.confirm("이 슬롯을 삭제할까요?"))deleteSaveSlot(realIdx);}} style={{...BTN_DANGER,padding:"5px 10px",fontSize:11}}>삭제</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
      {/* 선택화면 헤더 */}
      <div style={{background:C.hdrBg,color:C.hdrText,padding:"28px 24px 22px"}}>
        <div style={{maxWidth:960,margin:"0 auto"}}>
          <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:6}}>
            <div style={{width:44,height:44,borderRadius:12,background:"linear-gradient(135deg,#1d4ed8,#7c3aed)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>⚽</div>
            <div>
              <div style={{fontSize:22,fontWeight:800,letterSpacing:"-0.5px",lineHeight:1.1}}>풋볼 디렉터 2025</div>
              <div style={{fontSize:12,color:"#94a3b8",marginTop:2}}>9개 리그 · 300명+ 선수 · 유스 아카데미 · 6개 컵 대회</div>
            </div>
            {saveSlots.length>0&&(
              <button onClick={()=>{setSaveSlotName("");setShowSaveModal(true);}} style={{marginLeft:"auto",padding:"8px 18px",borderRadius:20,border:"1px solid #3b82f6",background:"#1e3a5f",color:"#60a5fa",cursor:"pointer",fontFamily:"inherit",fontWeight:700,fontSize:13,flexShrink:0}}>📂 불러오기</button>
            )}
          </div>
          {/* 난이도 */}
          <div style={{display:"flex",gap:6,alignItems:"center",marginTop:16,flexWrap:"wrap"}}>
            <span style={{fontSize:12,color:"#64748b",marginRight:4}}>난이도</span>
            {[{d:"입문",c:"#22c55e"},{d:"일반",c:"#3b82f6"},{d:"하드",c:"#f59e0b"},{d:"리얼리스틱",c:"#ef4444"}].map(({d,c})=>(
              <button key={d} onClick={()=>setDifficulty(d)} style={{padding:"5px 14px",fontSize:12,borderRadius:20,border:difficulty===d?`2px solid ${c}`:"1px solid #334155",background:difficulty===d?`${c}22`:"transparent",color:difficulty===d?c:"#94a3b8",cursor:"pointer",fontWeight:difficulty===d?700:400}}>{d}</button>
            ))}
          </div>
        </div>
      </div>
      {/* 리그 필터 */}
      <div style={{background:C.surface,borderBottom:`1px solid ${C.border}`,padding:"10px 24px",overflowX:"auto"}}>
        <div style={{maxWidth:960,margin:"0 auto",display:"flex",gap:6,flexWrap:"wrap"}}>
          {[["all","🌐","전체"],[...Object.entries(LEAGUES).map(([lid,l])=>[lid,l.flag,l.name])]].map(([lid,flag,name])=>(
            <button key={lid} onClick={()=>setLeagueFilter(lid)} style={{padding:"5px 12px",fontSize:12,borderRadius:20,border:leagueFilter===lid?`1.5px solid ${C.primary}`:`1px solid ${C.border}`,background:leagueFilter===lid?C.primaryLt:"transparent",color:leagueFilter===lid?C.primary:C.textMd,cursor:"pointer",fontWeight:leagueFilter===lid?600:400,whiteSpace:"nowrap"}}>{flag} {name}</button>
          ))}
        </div>
      </div>
      {/* 팀 목록 */}
      <div style={{maxWidth:960,margin:"0 auto",padding:"20px 24px"}}>
        {Object.entries(LEAGUES).filter(([lid])=>leagueFilter==="all"||leagueFilter===lid).map(([lid,league])=>(
          <div key={lid} style={{marginBottom:28}}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:12}}>
              <span style={{fontSize:20}}>{league.flag}</span>
              <span style={{fontWeight:700,fontSize:15,color:C.text}}>{league.name}</span>
              <span style={{fontSize:11,color:C.textSm,background:C.bg,padding:"2px 8px",borderRadius:10,border:`1px solid ${C.border}`}}>위상 {"⭐".repeat(Math.round(league.prestige/2))}</span>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:8}}>
              {league.teams.map(team=>{
                const cc=CLUB_COLORS[team.id];
                return(
                  <button key={team.id} onClick={()=>startGame(team.id)} style={{textAlign:"left",padding:"12px 14px",borderRadius:12,border:`1px solid ${C.border}`,background:C.surface,cursor:"pointer",display:"flex",alignItems:"center",gap:10,boxShadow:"0 1px 3px rgba(0,0,0,0.04)"}}>
                    <div style={{flexShrink:0}}><ClubLogo teamId={team.id} size={32}/></div>
                    <div style={{minWidth:0}}>
                      <div style={{fontWeight:700,fontSize:13,color:C.text,marginBottom:2,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{team.name}</div>
                      <div style={{fontSize:11,color:C.textSm}}>예산 {fmt(team.budget*15)}</div>
                      <div style={{display:"flex",alignItems:"center",gap:4,marginTop:3}}>
                        <div style={{height:4,width:Math.round(team.prestige*8),maxWidth:80,borderRadius:2,background:`linear-gradient(90deg,${cc?.bg||"#3b82f6"},${cc?.bg||"#3b82f6"}88)`}}/>
                        <span style={{fontSize:10,color:C.textSm}}>{team.prestige}/10</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
  // ─── 게임 화면 ───
  return(
    <div style={{fontFamily:"system-ui,-apple-system,sans-serif",fontSize:14,minHeight:"100vh",background:C.bg}}>
      {/* ══ 저장/불러오기 모달 ══ */}
      {showSaveModal&&(
        <div style={MODAL_OVERLAY} onClick={()=>setShowSaveModal(false)}>
          <div style={{...MODAL_BOX,maxWidth:480}} onClick={e=>e.stopPropagation()}>
            <div style={{fontWeight:800,fontSize:17,marginBottom:14,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span>💾 저장 / 불러오기</span>
              <button onClick={()=>setShowSaveModal(false)} style={{background:"none",border:"none",fontSize:18,cursor:"pointer",color:C.textSm}}>✕</button>
            </div>
            {/* 새 슬롯 저장 (게임 중일 때만) */}
            {screen==="game"&&(
              <div style={{marginBottom:16,padding:"12px",background:C.bg,border:`1px solid ${C.border}`,borderRadius:10}}>
                <div style={{fontSize:12,fontWeight:700,marginBottom:8,color:C.text}}>🆕 현재 게임 저장</div>
                <div style={{display:"flex",gap:8}}>
                  <input
                    value={saveSlotName}
                    onChange={e=>setSaveSlotName(e.target.value)}
                    placeholder={`S${season} ${selTeam?.name||""} (비워두면 자동명)`}
                    style={{...INPUT_S,flex:1,fontSize:12}}
                    onKeyDown={e=>e.key==="Enter"&&saveGame(null)}
                  />
                  <button onClick={()=>saveGame(null)} style={{...BTN_PRIMARY,padding:"9px 16px",fontSize:12,flexShrink:0}}>저장</button>
                </div>
              </div>
            )}
            {/* 저장 슬롯 목록 */}
            <div style={{fontSize:12,fontWeight:700,marginBottom:8,color:C.textMd}}>📋 저장 슬롯 ({saveSlots.length}/5)</div>
            {saveSlots.length===0?(
              <div style={{padding:"20px",textAlign:"center",color:C.textSm,fontSize:13}}>저장된 게임이 없습니다.</div>
            ):(
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {[...saveSlots].reverse().map((slot,ri)=>{
                  const realIdx=saveSlots.length-1-ri;
                  const d=new Date(slot.savedAt);
                  const dateStr=`${d.getMonth()+1}/${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2,"0")}`;
                  return(
                    <div key={realIdx} style={{padding:"10px 12px",background:C.surface,border:`1px solid ${C.border}`,borderRadius:10,display:"flex",alignItems:"center",gap:10}}>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontWeight:700,fontSize:13,color:C.text,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{slot.slotName||"저장 슬롯"}</div>
                        <div style={{fontSize:11,color:C.textSm,marginTop:2}}>
                          {slot.selTeam?.name} · S{slot.season} {slot.week}주차 · {LEAGUES[slot.selLeague]?.flag} · {dateStr}
                        </div>
                      </div>
                      <div style={{display:"flex",gap:6,flexShrink:0}}>
                        {screen==="game"&&(
                          <button onClick={()=>saveGame(realIdx)} style={{...BTN_WHITE,padding:"5px 10px",fontSize:11}}>덮어쓰기</button>
                        )}
                        <button onClick={()=>{if(window.confirm("이 슬롯을 불러올까요?"))loadGame(slot);}} style={{...BTN_PRIMARY,padding:"5px 12px",fontSize:11}}>불러오기</button>
                        <button onClick={()=>{if(window.confirm("이 슬롯을 삭제할까요?"))deleteSaveSlot(realIdx);}} style={{...BTN_DANGER,padding:"5px 10px",fontSize:11}}>삭제</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
      {notif&&(
        <div style={{position:"fixed",top:16,right:16,zIndex:9999,padding:"11px 18px",borderRadius:12,
          background:notif.type==="success"?C.successLt:notif.type==="error"?C.dangerLt:notif.type==="trophy"?C.warnLt:C.primaryLt,
          color:notif.type==="success"?C.success:notif.type==="error"?C.danger:notif.type==="trophy"?C.warn:C.primary,
          fontSize:13,fontWeight:600,border:"1.5px solid currentColor",maxWidth:340,
          boxShadow:"0 8px 24px rgba(0,0,0,0.15)",animation:"none"}}>
          {notif.msg}
        </div>
      )}
      {/* 상단 헤더 */}
      <div style={{background:C.hdrBg,color:C.hdrText,padding:"0 18px",display:"flex",gap:0,alignItems:"stretch",fontSize:13,boxShadow:"0 2px 12px rgba(0,0,0,0.25)",minHeight:52}}>
        {/* 클럽 */}
        <div style={{display:"flex",alignItems:"center",gap:10,paddingRight:18,borderRight:"1px solid #1e293b",minWidth:0}}>
          <ClubLogo teamId={selTeam?.id} size={28}/>
          <div>
            <div style={{fontWeight:800,fontSize:15,letterSpacing:"-0.3px",lineHeight:1.1,color:"#f1f5f9"}}>{selTeam?.name}</div>
            <div style={{fontSize:10,color:"#64748b"}}>{LEAGUES[selLeague]?.flag} {LEAGUES[selLeague]?.name}</div>
          </div>
        </div>
        {/* 핵심 스탯 칩들 */}
        <div style={{display:"flex",alignItems:"center",gap:0,flex:1,overflowX:"auto"}}>
          {[
            {label:"시즌",value:`S${season} · ${week}주차`,color:"#94a3b8"},
            {label:"예산",value:fmt(budget),color:"#4ade80"},
            {label:"순위",value:`${myPos}위 ${pts}pt`,color:"#fbbf24"},
            {label:"팬",value:`${fanApproval}% ${fanApproval>=75?"😊":fanApproval>=50?"😐":fanApproval>=30?"😠":"😡"}`,color:fanApproval>=60?"#94a3b8":"#f87171"},
          ].map(s=>(
            <div key={s.label} style={{padding:"0 14px",borderRight:"1px solid #1e293b",height:"100%",display:"flex",flexDirection:"column",justifyContent:"center",gap:1,flexShrink:0}}>
              <div style={{fontSize:9,color:"#475569",textTransform:"uppercase",letterSpacing:"0.5px"}}>{s.label}</div>
              <div style={{fontSize:13,fontWeight:700,color:s.color,lineHeight:1.2}}>{s.value}</div>
            </div>
          ))}
          {wonTrophies.length>0&&<div style={{padding:"0 14px",display:"flex",alignItems:"center",gap:2,fontSize:14}}>{wonTrophies.map((t,i)=><span key={i}>{t.icon}</span>)}</div>}
        </div>
        <button onClick={()=>setScreen("select")} style={{margin:"auto 0 auto 8px",fontSize:11,padding:"5px 14px",borderRadius:20,border:"1px solid #334155",background:"transparent",cursor:"pointer",color:"#64748b",flexShrink:0,fontFamily:"inherit",whiteSpace:"nowrap"}}>팀 변경</button>
        <button onClick={()=>{setSaveSlotName("");setShowSaveModal(true);}} style={{margin:"auto 0 auto 4px",fontSize:11,padding:"5px 14px",borderRadius:20,border:"1px solid #334155",background:"#1e3a5f",cursor:"pointer",color:"#60a5fa",flexShrink:0,fontFamily:"inherit",whiteSpace:"nowrap",fontWeight:700}}>💾 저장</button>
      </div>
      {/* 탭 */}
      <div style={{display:"flex",borderBottom:`2px solid ${C.border}`,overflowX:"auto",background:C.surface,boxShadow:"0 1px 6px rgba(0,0,0,0.05)"}}>
        {[["오버뷰","🏠"],["스쿼드","👥"],["유스","🌱"],["이적시장","💰"],["컵 대회","🏆"],["경기","🎮"],["재정","📊"],["뉴스","📰"],["순위표","📋"],["평점","⭐"],["통계","📈"],["구단 시설","🏗️"]].map(([t,icon])=>(
          <button key={t} onClick={()=>setTab(t)} style={{padding:"10px 14px",border:"none",borderBottom:tab===t?`3px solid ${C.primary}`:"3px solid transparent",background:"transparent",cursor:"pointer",fontSize:12,fontWeight:tab===t?700:500,color:tab===t?C.primary:C.textMd,whiteSpace:"nowrap",letterSpacing:tab===t?"-0.2px":"0",display:"flex",flexDirection:"column",alignItems:"center",gap:2,minWidth:60}}>
            <span style={{fontSize:16}}>{icon}</span>
            <span>{t}</span>
          </button>
        ))}
      </div>
      <div style={{padding:"16px",maxWidth:1100,margin:"0 auto"}}>
      {/* ── 오버뷰 ── */}
      {tab==="오버뷰"&&(
        <div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:10,marginBottom:"1rem"}}>
            {[
              {l:"현재 순위",v:`${myPos}위`,s:`${pts}승점`,ic:"🏆",accent:"#1d4ed8"},
              {l:"이적 예산",v:fmt(budget),s:`한도 ${fmt(budgetBase+permBudgetBonus)}`,ic:"💰",accent:"#15803d"},
              {l:"팬 지지도",v:`${fanApproval}%`,s:fanApproval>=70?"안정":"⚠️위기",ic:fanApproval>=70?"😊":"😠",accent:fanApproval>=70?"#15803d":"#dc2626"},
              {l:"스쿼드",v:`${squad.length}명`,s:`부상 ${injured.length}명`,ic:"👥",accent:"#7c3aed"},
              {l:"트로피",v:wonTrophies.length,s:wonTrophies.map(t=>t.icon).join("")||"없음",ic:"🥇",accent:"#d97706"},
            ].map(c=>(
              <div key={c.l} style={{background:C.surface,border:`1px solid ${C.border}`,padding:"14px 16px",borderRadius:12,borderLeft:`4px solid ${c.accent}`,boxShadow:"0 1px 4px rgba(0,0,0,0.04)"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                  <div style={{fontSize:11,color:C.textSm,fontWeight:500,marginBottom:6}}>{c.l}</div>
                  <span style={{fontSize:16}}>{c.ic}</span>
                </div>
                <div style={{fontSize:22,fontWeight:800,color:c.accent,letterSpacing:"-0.5px",lineHeight:1}}>{c.v}</div>
                <div style={{fontSize:11,color:C.textSm,marginTop:4}}>{c.s}</div>
              </div>
            ))}
          </div>
          {permWageBonus>0&&<div style={{padding:"10px 14px",background:"#fefce8",border:"1px solid #fde68a",borderRadius:10,fontSize:13,color:"#854d0e",marginBottom:"1rem"}}>🏆 컵 우승 영구 보너스: 연봉한도 +{fmt(permWageBonus)}</div>}
          {ballonDorHistory.filter(b=>b.isMyPlayer).length>0&&(
            <div style={{padding:"10px 14px",background:"linear-gradient(135deg,#fefce8,#fef9c3)",border:"1px solid #f59e0b",borderRadius:10,fontSize:13,color:"#92400e",marginBottom:"1rem"}}>
              🏅 발롱도르 수상: {ballonDorHistory.filter(b=>b.isMyPlayer).map(b=>`S${b.season} ${b.winner?.name}`).join(" · ")}
            </div>
          )}
          {retiredLegends.filter(l=>l.tier!=="일반").length>0&&(
            <div style={{padding:"10px 14px",background:"linear-gradient(135deg,#f8fafc,#eff6ff)",border:"1px solid #bfdbfe",borderRadius:10,fontSize:13,color:"#1e3a8a",marginBottom:"1rem",display:"flex",justifyContent:"space-between",alignItems:"center",gap:10,flexWrap:"wrap"}}>
              <span>🏆 은퇴 명예의 전당: {retiredLegends.filter(l=>l.tier!=="일반").slice(0,5).map(l=>`${l.tier==="레전드"?"👑":"👏"}${l.name}(S${l.season})`).join(" · ")}</span>
              <button onClick={()=>setShowHallOfFame(true)} style={{...BTN_WHITE,padding:"4px 10px",fontSize:11,flexShrink:0}}>전체 보기</button>
            </div>
          )}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:"1rem"}}>
            <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,padding:"1rem",boxShadow:"0 1px 4px rgba(0,0,0,0.04)"}}>
              <div style={{fontWeight:700,marginBottom:10,fontSize:14,color:C.text,display:"flex",alignItems:"center",gap:6}}>📊 <span>리그 순위표</span></div>
              {sortedTable.slice(0,8).map((row,i)=>(
                <div key={row.id} style={{display:"flex",gap:6,padding:"6px 8px",borderRadius:8,background:row.id===selTeam?.id?C.primaryLt:"transparent",marginBottom:2,alignItems:"center"}}>
                  <span style={{fontSize:11,color:i<3?"#f59e0b":C.textSm,width:18,fontWeight:i<3?700:400}}>{i+1}</span>
                  <span style={{fontSize:12,flex:1,fontWeight:row.id===selTeam?.id?700:400,color:row.id===selTeam?.id?C.primary:C.text}}>{row.name}</span>
                  <span style={{fontSize:10,color:C.textSm}}>{row.p}경</span>
                  <span style={{fontSize:12,fontWeight:700,minWidth:22,textAlign:"right",color:row.id===selTeam?.id?C.primary:C.text}}>{row.pts}</span>
                </div>
              ))}
            </div>
            <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,padding:"1rem",boxShadow:"0 1px 4px rgba(0,0,0,0.04)"}}>
              <div style={{fontWeight:700,marginBottom:10,fontSize:14,color:C.text,display:"flex",alignItems:"center",gap:6}}>📰 <span>최근 뉴스</span></div>
              {news.slice(0,10).map(n=>(
                <div key={n.id} style={{fontSize:12,padding:"5px 0",borderBottom:`1px solid ${C.bg}`,color:n.type==="drama"||n.type==="fan"?C.danger:n.type==="fake"||n.type==="injury"?C.warn:n.type==="transfer"?C.success:n.type==="trophy"?"#92400e":C.text,lineHeight:1.4}}>{n.msg}</div>
              ))}
            </div>
          </div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:12}}>
            <button onClick={()=>setShowLineup(true)} style={{...BTN_WHITE,padding:"10px 18px",fontSize:13}}>📋 선발 명단</button>
            {!seasonFinished?(
              <button onClick={playMatch} style={{...BTN_PRIMARY,padding:"10px 22px",fontSize:13}}>▶ 경기 진행 <span style={{fontWeight:400,opacity:0.8,fontSize:12}}>(주{week} / {table.find(r=>r.id===selTeam?.id)?.p||0}/{SEASON_MATCHES}경기)</span></button>
            ):(
              <button onClick={()=>setShowSeasonEnd(true)} style={{...BTN_SUCCESS,padding:"10px 22px",fontSize:13}}>📊 시즌 결과 보기</button>
            )}
            <button onClick={()=>{if(fakeUsed){notify("이번 시즌 이미 사용함","error");return;}setShowFake(true);}} style={{padding:"10px 16px",borderRadius:8,border:`1.5px solid ${C.border}`,background:fakeUsed?"#f1f5f9":C.surface,cursor:"pointer",fontSize:13,color:fakeUsed?C.textSm:C.warn,fontFamily:"inherit",fontWeight:500}}>📰 가짜뉴스{fakeUsed?" ✓":""}</button>
            <button onClick={()=>setShowRatingModal(true)} style={{...BTN_WHITE,padding:"10px 16px",fontSize:13}}>⭐ 선수 평점</button>
            <button onClick={()=>setShowAnalyst(true)} style={{...BTN_WHITE,padding:"10px 16px",fontSize:13}}>🔍 분석가</button>
            <button onClick={()=>setShowHallOfFame(true)} style={{...BTN_WHITE,padding:"10px 16px",fontSize:13}}>🏛️ 명예의 전당</button>
          </div>
          {/* 클럽 인포 */}
          <div style={{padding:"12px 16px",background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,display:"flex",alignItems:"center",gap:14,boxShadow:"0 1px 4px rgba(0,0,0,0.04)"}}>
            <ClubLogo teamId={selTeam?.id} size={44}/>
            <div>
              <div style={{fontWeight:800,fontSize:16,color:C.text}}>{selTeam?.name}</div>
              <div style={{fontSize:12,color:C.textMd,marginTop:1}}>{LEAGUES[selLeague]?.flag} {LEAGUES[selLeague]?.name} · 시즌 {season} · {week}주차</div>
              <div style={{fontSize:11,color:C.textSm,marginTop:2}}>위상 {"⭐".repeat(Math.round((selTeam?.prestige||6)/2))} · 전략: {selTeam?.ts}</div>
            </div>
          </div>
          {selTeam?.rivals?.length>0&&<div style={{marginTop:10,padding:"10px 14px",background:C.dangerLt,border:"1px solid #fecaca",borderRadius:10,fontSize:12,color:C.danger}}>⚠️ 라이벌: {selTeam.rivals.map(r=>ALL_TEAMS.find(t=>t.id===r)?.name).filter(Boolean).join(", ")} — 패배 시 팬 지지도 급락</div>}
        </div>
      )}
      {/* ── 스쿼드 ── */}
      {tab==="스쿼드"&&(
        <div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <div>
              <span style={{fontWeight:800,fontSize:16,color:C.text}}>스쿼드</span>
              <span style={{fontSize:13,color:C.textSm,marginLeft:8}}>{squad.length}/30명 · 포메이션 <span style={{color:C.primary,fontWeight:700}}>{formation}</span></span>
            </div>
            <button onClick={()=>setShowLineup(true)} style={{...BTN_PRIMARY,padding:"8px 16px",fontSize:13}}>📋 포메이션 설정</button>
          </div>
          {pendingSales.length>0&&(
            <div style={{marginBottom:14,padding:"10px 14px",background:"#fff7ed",border:"1.5px solid #fed7aa",borderRadius:10}}>
              <div style={{fontSize:13,fontWeight:700,color:"#92400e",marginBottom:6}}>📋 이적 시장 등록 대기 중 ({pendingSales.length}명)</div>
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                {pendingSales.map(s=>(
                  <div key={s.player.id} style={{display:"flex",alignItems:"center",gap:6,padding:"5px 10px",background:"#fff",borderRadius:8,border:"1px solid #fde68a",fontSize:12}}>
                    <span style={{fontWeight:700}}>{s.player.name}</span>
                    <span style={{color:C.textSm}}>{s.player.pos}</span>
                    <span style={{color:C.warn,fontWeight:600}}>{fmt(s.askFee)}</span>
                    <button onClick={e=>{e.stopPropagation();setPendingSales(prev=>prev.filter(ps=>ps.player.id!==s.player.id));setSquad(prev=>prev.map(p=>p.id===s.player.id?{...p,leave:false}:p));addNews(`🔄 ${s.player.name} 이적 시장 등록 철회`,"transfer");notify(`등록 취소`,"info");}} style={{fontSize:10,padding:"2px 6px",borderRadius:4,border:`1px solid ${C.border}`,background:C.surface,cursor:"pointer",color:"#666"}}>취소</button>
                  </div>
                ))}
              </div>
              <div style={{fontSize:10,color:"#a16207",marginTop:6}}>※ 다음 경기 후 오퍼 결과가 자동으로 통보됩니다</div>
            </div>
          )}
          {["GK","CB","RB","LB","CDM","CM","CAM","RW","LW","CF","ST"].map(pos=>{
            const pp=squad.filter(p=>p.pos===pos);if(!pp.length)return null;
            return(
              <div key={pos} style={{marginBottom:14}}>
                <div style={{fontSize:11,fontWeight:700,color:C.textSm,marginBottom:6,textTransform:"uppercase",letterSpacing:"1px",display:"flex",alignItems:"center",gap:6}}>
                  <span>{pos}</span><span style={{color:C.border}}>|</span><span style={{color:C.textSm,fontWeight:400}}>{pp.length}명</span>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:6}}>
                  {pp.map(p=>{
                    const isInj=injured.includes(p.id);
                    const isStarting=lineup.includes(p.id);
                    const cond=playerConditions[p.id]??100;
                    const condColor=cond>=80?"#15803d":cond>=60?"#d97706":"#dc2626";
                    return(
                      <div key={p.id} onClick={()=>setDetail(p)} style={{padding:"10px 12px",borderRadius:10,border:isInj?`1.5px solid #fca5a5`:isStarting?`1.5px solid ${C.primaryBd}`:`1px solid ${C.border}`,background:isInj?C.dangerLt:isStarting?C.primaryLt:C.surface,cursor:"pointer",display:"flex",alignItems:"center",gap:10,boxShadow:"0 1px 3px rgba(0,0,0,0.04)"}}>
                        <div style={{position:"relative",flexShrink:0}}>
                          <div style={{width:38,height:38,borderRadius:"50%",background:getPlayerAvatar(p.pos),display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:14,color:"#fff",border:isInj?`2px solid ${C.danger}`:isStarting?`2px solid ${C.primary}`:"2px solid transparent"}}>{p.rat}</div>
                          {p.isVirtual&&<div style={{position:"absolute",bottom:-2,right:-2,fontSize:9,background:"#7c3aed",color:"#fff",borderRadius:3,padding:"0 3px",lineHeight:1.5}}>신</div>}
                        </div>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontWeight:700,fontSize:13,color:isInj?C.danger:C.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.isIcon?"👑 ":""}{p.name}{isInj?` 🩹${injuryMatches[p.id]?`(${injuryMatches[p.id]}경기)`:""}`:""}{isStarting?" ⭐":""}{(()=>{const m=playerMorale[p.id];if(m===undefined)return null;const ic=m>=80?"😊":m>=60?"😐":m>=40?"😟":"😡";return<span style={{fontSize:9,marginLeft:3}}>{ic}</span>;})()}</div>
                          <div style={{fontSize:11,color:C.textSm,marginTop:1}}>{p.nat} · {p.age}세 · €{p.wage}M/주</div>
                          <div style={{display:"flex",gap:4,marginTop:2,alignItems:"center"}}>
                            {(()=>{const c=p.contract||0;const cColor=c>=3?C.success:c>=2?C.warn:C.danger;return<span style={{fontSize:9,padding:"1px 5px",borderRadius:3,background:`${cColor}18`,color:cColor,border:`1px solid ${cColor}44`,fontWeight:700}}>계약 {c}년</span>;})()}
                          </div>
                          {(()=>{
                            const pr=playerRatings[p.id];
                            const potDiff=p.pot-p.rat;
                            return(
                              <div style={{display:"flex",gap:4,marginTop:3,flexWrap:"wrap",alignItems:"center"}}>
                                {/* 잠재력 배지 */}
                                <span style={{fontSize:9,padding:"1px 6px",borderRadius:4,background:C.bg,color:getPotI(p).color,border:`1px solid ${getPotI(p).color}44`,fontWeight:700}}>{getPotI(p).label}</span>
                                {cond!==undefined&&<span style={{fontSize:9,padding:"1px 5px",borderRadius:4,background:cond>=80?"#f0fdf4":cond>=60?"#fefce8":"#fff5f5",color:cond>=80?"#16a34a":cond>=60?"#854d0e":"#dc2626",border:"1px solid currentColor",fontWeight:600}}>컨{cond}%</span>}
                                {pr&&pr.count>0&&<span style={{fontSize:9,padding:"1px 5px",borderRadius:4,background:"#eff6ff",color:"#2563eb",border:"1px solid #bfdbfe"}}>평점{pr.avg}</span>}
                                {p.bubble&&<span style={{fontSize:9,background:"#fefce8",color:"#854d0e",padding:"1px 5px",borderRadius:4,border:"1px solid #fde68a"}}>거품</span>}
                                {p.age>=34&&<span style={{fontSize:9,background:"#fff5f5",color:C.danger,padding:"1px 5px",borderRadius:4,border:"1px solid #fecaca"}}>노장</span>}
                                <span style={{fontSize:9,background:p.age>=35?"#f3f4f6":"#fff5f5",color:p.age>=35?"#4b5563":"#dc2626",padding:"1px 5px",borderRadius:4,border:p.age>=35?"1px solid #d1d5db":"1px solid #fecaca",fontWeight:700}}>{p.age>=35?"은퇴가능":"조기은퇴"}</span>
                              </div>
                            );
                          })()}
                        </div>
                        <div style={{display:"flex",flexDirection:"column",gap:4,alignItems:"flex-end"}}>
                          <button onClick={e=>{e.stopPropagation();openSell(p);}} style={{padding:"3px 7px",fontSize:10,borderRadius:5,border:`1px solid ${C.border}`,background:C.surface,cursor:"pointer",color:"#666"}}>매각</button>
                          <select value={p.pos} onClick={e=>e.stopPropagation()} onChange={e=>{
                            const newPos=e.target.value;
                            setSquad(prev=>prev.map(s=>s.id===p.id?{...s,pos:newPos}:s));
                            notify(`${p.name} 포지션 → ${newPos} 변경`,"success");
                          }} title="포지션 변경 — 스쿼드를 자유롭게 구성하세요" style={{padding:"3px 5px",fontSize:10,borderRadius:5,border:`1px solid ${C.border}`,background:C.surface,cursor:"pointer",color:"#666",fontFamily:"inherit"}}>
                            {POS_POOL.map(pos=><option key={pos} value={pos}>{pos}</option>)}
                          </select>
                          <button onClick={e=>{e.stopPropagation();openRetireModal(p);}} style={{padding:"3px 7px",fontSize:10,borderRadius:5,border:"1px solid #fecaca",background:"#fff5f5",cursor:"pointer",color:C.danger,fontWeight:600}}>🏁 은퇴</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
      {/* ── 유스 (2군 육성) ── */}
      {tab==="유스"&&(
        <div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <div>
              <span style={{fontWeight:800,fontSize:16,color:C.text}}>유스 아카데미</span>
              <span style={{fontSize:13,color:C.textSm,marginLeft:8}}>{youthSquad.length}명 · 17~20세 유망주</span>
            </div>
            <button onClick={()=>setShowYouthScout(true)} style={{...BTN_WHITE,padding:"7px 14px",fontSize:12}}>🔭 타팀 유스 스카우트</button>
          </div>
          <div style={{padding:"10px 14px",background:C.primaryLt,border:`1px solid ${C.primaryBd}`,borderRadius:10,marginBottom:12,fontSize:12,color:"#1e40af"}}>
            💡 잠재력이 높은 선수는 시즌마다 빠르게 성장합니다. 1군에 자리가 필요하면 승격시키세요 (영입 비용 없음).
          </div>
          {youthSquad.length===0&&<div style={{color:C.textSm,fontSize:13,padding:"20px",textAlign:"center"}}>유스 선수가 없습니다. 시즌이 지나면 새로운 유망주가 합류합니다.</div>}
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(230px,1fr))",gap:8}}>
            {youthSquad.map(p=>{
              const potDiff=p.pot-p.rat;
              return(
                <div key={p.id} onClick={()=>setShowYouthDetail(p)} style={{padding:"10px 12px",borderRadius:10,border:`1px solid ${C.border}`,background:C.surface,cursor:"pointer",display:"flex",alignItems:"center",gap:10}}>
                  <div style={{width:36,height:36,borderRadius:"50%",background:getPlayerAvatar(p.pos),display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:14,color:"#fff",flexShrink:0}}>{p.rat}</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontWeight:600,fontSize:13}}>{p.name} <span style={{fontSize:10,color:C.textSm}}>{p.pos}</span></div>
                    <div style={{fontSize:11,color:C.textSm}}>{p.nat} · {p.age}세</div>
                    <div style={{display:"flex",gap:4,marginTop:3,flexWrap:"wrap"}}>
                      <span style={{fontSize:9,padding:"1px 6px",borderRadius:4,background:C.bg,color:getPotI(p).color,border:`1px solid ${getPotI(p).color}44`,fontWeight:700}}>{getPotI(p).label}</span>
                      {potDiff>0&&<span style={{fontSize:9,padding:"1px 6px",borderRadius:4,background:"#f0fdf4",color:C.success,border:"1px solid #bbf7d0",fontWeight:700}}>성장여지 +{potDiff}</span>}
                    </div>
                  </div>
                  <div style={{display:"flex",flexDirection:"column",gap:4,alignItems:"flex-end"}}>
                    <button onClick={e=>{
                      e.stopPropagation();
                      if(p.age<17){notify("17세 이상부터 1군 승격이 가능합니다","error");return;}
                      if(squad.length>=30){notify("1군 스쿼드가 가득 찼습니다 (30명)","error");return;}
                      if(p.isIcon&&squad.filter(s=>s.isIcon).length>=3){notify("👑 아이콘 선수는 팀 내 최대 3명까지만 보유 가능합니다","error");return;}
                      // 1군 승격 연봉 협상 모달 오픈
                      const demandW=parseFloat((p.val*0.12+0.3).toFixed(1));
                      setYouthNegTarget(p);setYouthNegWage(demandW);setShowYouthNeg(true);
                    }} disabled={p.age<17} style={{padding:"4px 9px",fontSize:10,borderRadius:5,border:"1px solid #bfdbfe",background:p.age<17?"#f1f5f9":"#eff6ff",cursor:p.age<17?"not-allowed":"pointer",color:p.age<17?"#aaa":"#2563eb",fontWeight:600}}>⬆️ {p.age<17?"승격불가(17세+)":"1군승격"}</button>
                    <button onClick={e=>{
                      e.stopPropagation();
                      setYouthSquad(prev=>prev.filter(y=>y.id!==p.id));
                      {const gi=ALL_YOUTH_PLAYERS.findIndex(y=>y.id===p.id);if(gi!==-1)ALL_YOUTH_PLAYERS.splice(gi,1);}
                      notify(`${p.name} 방출됨`,"info");
                    }} style={{padding:"4px 9px",fontSize:10,borderRadius:5,border:`1px solid ${C.border}`,background:C.surface,cursor:"pointer",color:"#666"}}>방출</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {/* ── 이적시장 ── */}
      {tab==="이적시장"&&(
        <div>
          {/* ── FA 필터 버튼 ── */}
          <div style={{display:"flex",gap:8,marginBottom:12,alignItems:"center"}}>
            <button onClick={()=>setFaMarketFilter(false)} style={{padding:"7px 16px",borderRadius:8,border:`1.5px solid ${!faMarketFilter?C.primary:C.border}`,background:!faMarketFilter?C.primary:"#fff",color:!faMarketFilter?"#fff":C.textMd,cursor:"pointer",fontFamily:"inherit",fontSize:12,fontWeight:700}}>📋 전체 시장</button>
            <button onClick={()=>setFaMarketFilter(true)} style={{padding:"7px 16px",borderRadius:8,border:`1.5px solid ${faMarketFilter?"#16a34a":C.border}`,background:faMarketFilter?"#16a34a":"#fff",color:faMarketFilter?"#fff":C.textMd,cursor:"pointer",fontFamily:"inherit",fontSize:12,fontWeight:700}}>🆓 FA 시장 <span style={{fontSize:10,fontWeight:400}}>({faPlayers.length}명)</span></button>
            {faMarketFilter&&<span style={{fontSize:11,color:C.textSm}}>이적료 0 · 주급 협상만으로 영입 가능</span>}
          </div>
          {faMarketFilter&&(
            <div style={{marginBottom:16}}>
              <div style={{fontWeight:700,fontSize:14,marginBottom:10,display:"flex",alignItems:"center",gap:8}}>
                🆓 자유계약(FA) 선수 시장
                <span style={{fontSize:11,color:C.textSm,fontWeight:400}}>계약 만료 선수 {faPlayers.length}명 · 이적료 없음</span>
              </div>
              <div style={{display:"flex",gap:6,marginBottom:10,flexWrap:"wrap",alignItems:"center"}}>
                {["all","GK","DF","MF","FW"].map(pos=>(
                  <button key={pos} onClick={()=>setFaPosFilter(pos)} style={{padding:"4px 10px",borderRadius:6,border:`1px solid ${faPosFilter===pos?C.primary:C.border}`,background:faPosFilter===pos?C.primary:"#fff",color:faPosFilter===pos?"#fff":C.textMd,cursor:"pointer",fontFamily:"inherit",fontSize:11,fontWeight:faPosFilter===pos?700:400}}>{pos==="all"?"전체":pos}</button>
                ))}
                <div style={{display:"flex",alignItems:"center",gap:6,marginLeft:4}}>
                  <span style={{fontSize:11,color:C.textSm}}>최소OVR</span>
                  <input type="range" min={50} max={90} step={5} value={faMinOvr} onChange={e=>setFaMinOvr(Number(e.target.value))} style={{width:80,accentColor:C.primary}}/>
                  <span style={{fontSize:11,fontWeight:700,color:C.primary,minWidth:20}}>{faMinOvr}</span>
                </div>
              </div>
              {faPlayers.filter(p=>{
                const POS_GROUP={GK:["GK"],DF:["CB","LB","RB"],MF:["CDM","CM","CAM"],FW:["LW","RW","ST","CF"]};
                if(faPosFilter!=="all"&&!(POS_GROUP[faPosFilter]||[]).includes(p.pos))return false;
                if(p.rat<faMinOvr)return false;
                return true;
              }).length===0?(
                <div style={{padding:"2rem",textAlign:"center",color:C.textSm,fontSize:13,background:C.surface,borderRadius:12,border:`1px dashed ${C.border}`}}>조건에 맞는 FA 선수가 없습니다</div>
              ):(
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:10}}>
                  {faPlayers.filter(p=>{
                    const POS_GROUP={GK:["GK"],DF:["CB","LB","RB"],MF:["CDM","CM","CAM"],FW:["LW","RW","ST","CF"]};
                    if(faPosFilter!=="all"&&!(POS_GROUP[faPosFilter]||[]).includes(p.pos))return false;
                    if(p.rat<faMinOvr)return false;
                    return true;
                  }).slice(0,40).map(p=>{
                    const owned=squadIdSet.has(p.id);
                    const suggestWage=parseFloat((p.val*0.012).toFixed(1));
                    const offerWage=faWageOffer[p.id]||suggestWage;
                    const canSign=!owned&&squad.length<30;
                    const ageColor=p.age<=22?"#7c3aed":p.age<=27?C.success:p.age<=30?C.warn:C.danger;
                    return(
                      <div key={p.id} style={{padding:"14px",borderRadius:12,border:"1.5px solid #bbf7d0",background:"#f0fdf4",boxShadow:"0 1px 4px rgba(0,0,0,0.05)"}}>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                          <div style={{flex:1,minWidth:0}}>
                            <div style={{fontWeight:700,fontSize:13,marginBottom:3}}>{p.isIcon?"👑 ":""}{p.name}</div>
                            <div style={{display:"flex",gap:4,flexWrap:"wrap",alignItems:"center"}}>
                              <span style={{fontSize:11,background:C.bg,color:C.textMd,padding:"2px 7px",borderRadius:6,fontWeight:700}}>{p.pos}</span>
                              <span style={{fontSize:11,background:`${ageColor}18`,color:ageColor,padding:"2px 7px",borderRadius:6,fontWeight:700,border:`1px solid ${ageColor}44`}}>{p.age}세</span>
                              <span style={{fontSize:10,color:C.textSm}}>{p.nat}</span>
                            </div>
                          </div>
                          <div style={{width:40,height:40,borderRadius:"50%",background:getPlayerAvatar(p.pos),display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:15,color:"#fff",flexShrink:0,marginLeft:8}}>{p.rat}</div>
                        </div>
                        <div style={{display:"flex",gap:3,fontSize:11,marginBottom:10}}>
                          {[["속",p.pace],["슈",p.sho],["패",p.pas],["드",p.dri],["수",p.def],["체",p.phy]].map(([k,v])=>(
                            <div key={k} style={{flex:1,background:"#dcfce7",padding:"3px 4px",borderRadius:6,textAlign:"center",border:"1px solid #bbf7d0"}}>
                              <div style={{color:C.textSm,fontSize:9}}>{k}</div>
                              <div style={{fontWeight:700,color:C.text,fontSize:12}}>{v}</div>
                            </div>
                          ))}
                        </div>
                        <div style={{marginBottom:10}}>
                          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                            <span style={{fontSize:11,color:C.textSm}}>제시 주급</span>
                            <span style={{fontSize:14,fontWeight:800,color:"#16a34a"}}>€{offerWage}M/주</span>
                          </div>
                          <input type="range" min={parseFloat((suggestWage*0.5).toFixed(1))} max={parseFloat((suggestWage*3).toFixed(1))} step={0.1} value={offerWage} onChange={e=>setFaWageOffer(prev=>({...prev,[p.id]:parseFloat(e.target.value)}))} style={{width:"100%",accentColor:"#16a34a"}}/>
                          {offerWage<suggestWage*0.7&&<div style={{fontSize:10,color:C.warn,marginTop:3}}>⚠️ 낮은 제시 — 선수가 거부할 수 있습니다</div>}
                        </div>
                        {!owned?(
                          <button onClick={()=>{
                            if(squad.length>=30){notify("스쿼드 만원(30명)","error");return;}
                            const acceptChance=offerWage>=suggestWage?0.95:offerWage>=suggestWage*0.7?0.65:0.30;
                            if(Math.random()>acceptChance){notify(`${p.name}이 제시 주급을 거절했습니다!`,"error");addNews(`❌ ${p.name} FA 영입 거절`,"drama");return;}
                            const cappedWage=getCappedWage(offerWage,3);
                            setSquad(prev=>[...prev,{...p,wage:cappedWage,contract:3,club:selTeam.id,contractEndSeason:season+3}]);
                            const pidx=ALL_PLAYERS.findIndex(ap=>ap.id===p.id);
                            if(pidx!==-1)ALL_PLAYERS[pidx]={...ALL_PLAYERS[pidx],club:selTeam.id};
                            setTLog(prev=>[...prev,{type:"buy",player:p.name,fee:0,week,season}]);
                            addNews(`🆓 ${p.name} FA 영입 완료! (이적료 0 · 주급 €${cappedWage}M · 계약 3년)`,"transfer");
                            notify(`${p.name} FA 영입 성공!`,"success");
                            setFaWageOffer(prev=>{const n={...prev};delete n[p.id];return n;});
                          }} style={{...BTN_SUCCESS,width:"100%",padding:"9px",fontSize:12,opacity:canSign?1:0.5,cursor:canSign?"pointer":"not-allowed"}}>🆓 FA 영입 확정</button>
                        ):<span style={{fontSize:12,color:C.success,fontWeight:700,display:"block",textAlign:"center"}}>✓ 보유중</span>}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
          {!faMarketFilter&&<>
          <div style={{marginBottom:14,padding:"12px 14px",background:"linear-gradient(135deg,#eff6ff,#fef2f2)",border:"1.5px solid #93c5fd",borderRadius:12}}>
            <div style={{fontWeight:700,fontSize:14,marginBottom:8,display:"flex",alignItems:"center",gap:6}}>
              <span>🇰🇷 한국 선수 전용 매물</span>
              <span style={{fontSize:11,color:C.textSm,fontWeight:400}}>· {koreanMarketPlayers.length}명</span>
            </div>
            {koreanMarketPlayers.length===0?(
              <div style={{fontSize:12,color:C.textSm,padding:"8px 2px"}}>현재 시장에 나온 한국 선수가 없습니다.</div>
            ):(
              <div style={{display:"flex",gap:8,overflowX:"auto",paddingBottom:4}}>
                {koreanMarketPlayers.map(p=>{
                  const owned=squadIdSet.has(p.id);
                  const realVal=getMarketVal(p);
                  const canAfford=budget>=realVal*0.65;
                  return(
                    <div key={p.id} style={{flex:"0 0 200px",padding:"10px 12px",borderRadius:10,border:p.isWonderkid?"1.5px solid #f59e0b":`1.5px solid ${C.border}`,background:p.isWonderkid?"linear-gradient(135deg,#fefce8,#fff)":C.surface,boxShadow:"0 1px 4px rgba(0,0,0,0.05)"}}>
                      <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:6}}>
                        <div style={{width:34,height:34,borderRadius:"50%",background:getPlayerAvatar(p.pos),display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:13,color:"#fff",flexShrink:0}}>{p.rat}</div>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontWeight:700,fontSize:12,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.isIcon?"👑 ":""}{p.name}</div>
                          <div style={{fontSize:10,color:C.textSm}}>{p.pos} · {p.age}세</div>
                        </div>
                      </div>
                      {p.isWonderkid&&<div style={{fontSize:10,fontWeight:700,color:C.warn,background:"#fef3c7",borderRadius:4,padding:"2px 6px",marginBottom:6,display:"inline-block"}}>🌟 5년에 한번 나오는 천재 (잠재 {p.pot})</div>}
                      <div style={{fontSize:11,color:"#555",marginBottom:6}}>{teamNameMap[p.club]||"🆓 자유계약"} · 잠재 {p.pot}</div>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                        <span style={{fontSize:12,fontWeight:700,color:canAfford?"#111":"#dc2626"}}>{fmt(realVal)}</span>
                        {!owned?(
                          (()=>{
                            const iconFull=p.isIcon&&squad.filter(s=>s.isIcon).length>=3;
                            return <button onClick={()=>{if(iconFull){notify('👑 아이콘 선수는 팀 내 최대 3명까지만 보유 가능합니다','error');return;}setTTarget(p);setTOffer(Math.round(realVal));setTOfferInput(String(Math.round(realVal)));setShowNeg(true);}} style={{...BTN_PRIMARY,padding:'4px 10px',fontSize:11,opacity:(canAfford&&!iconFull)?1:0.5,cursor:(canAfford&&!iconFull)?'pointer':'not-allowed'}}>{iconFull?'👑한도초과':'협상'}</button>;
                          })()
                        ):<span style={{fontSize:11,color:C.success,fontWeight:600}}>✓보유중</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          <div style={{display:"flex",gap:6,marginBottom:8,flexWrap:"wrap"}}>
            {[["all","전체"],["GK","골키퍼"],["DF","수비수"],["MF","미드필더"],["FW","공격수"]].map(([k,label])=>(
              <button key={k} onClick={()=>{setPosFilter(k);setMarketPage(0);}} style={{padding:"5px 14px",fontSize:12,borderRadius:20,border:posFilter===k?`2px solid ${C.primary}`:`1px solid ${C.border}`,background:posFilter===k?C.primaryLt:C.surface,color:posFilter===k?C.primary:C.textMd,cursor:"pointer",fontWeight:posFilter===k?700:400}}>{label}</button>
            ))}
          </div>
          <div style={{display:"flex",gap:6,marginBottom:10,alignItems:"center",flexWrap:"wrap"}}>
            <span style={{fontSize:12,color:C.textSm,fontWeight:600}}>정렬:</span>
            {[["rat","⭐ 능력치"],["age_asc","🔼 어린순"],["age_desc","🔽 많은순"],["val","💰 가치"]].map(([k,label])=>(
              <button key={k} onClick={()=>{setMarketSort(k);setMarketPage(0);}} style={{padding:"4px 12px",fontSize:12,borderRadius:20,border:marketSort===k?"2px solid #7c3aed":`1px solid ${C.border}`,background:marketSort===k?"#f5f3ff":C.surface,color:marketSort===k?"#7c3aed":C.textMd,cursor:"pointer",fontWeight:marketSort===k?700:400}}>{label}</button>
            ))}
          </div>
          <div style={{display:"flex",gap:8,marginBottom:12,flexWrap:"wrap",alignItems:"center"}}>
            <input value={searchQ} onChange={e=>{setSearchQ(e.target.value);setMarketPage(0);}} placeholder="이름 / 국적 검색..." style={{...INPUT_S,width:180}} />
            <select value={posFilter} onChange={e=>{setPosFilter(e.target.value);setMarketPage(0);}} style={{padding:"8px 10px",borderRadius:9,border:`1.5px solid ${C.border}`,background:C.surface,fontSize:13,color:C.text,fontFamily:"inherit"}}>
              <option value="all">전 포지션</option>
              {["GK","CB","RB","LB","CDM","CM","CAM","RW","LW","CF","ST"].map(p=><option key={p} value={p}>{p}</option>)}
            </select>
            <div style={{display:"flex",alignItems:"center",gap:8,background:C.surface,border:`1px solid ${C.border}`,borderRadius:9,padding:"6px 12px"}}>
              <span style={{fontSize:12,color:C.textSm}}>최대</span>
              <input type="range" min={50} max={5000} step={50} value={maxVal} onChange={e=>{setMaxVal(Number(e.target.value));setMarketPage(0);}} style={{width:100,accentColor:C.primary}} />
              <span style={{fontSize:12,fontWeight:700,color:C.text,minWidth:56}}>{fmt(maxVal)}</span>
            </div>
            <div style={{fontSize:12,color:C.textSm,padding:"7px 12px",background:C.successLt,borderRadius:9,border:`1px solid #bbf7d0`}}>예산 <strong style={{color:C.success}}>{fmt(budget)}</strong></div>
          </div>
          {(()=>{
            const totalPages=Math.ceil(marketPlayers.length/MARKET_PAGE_SIZE);
            const pageSlice=marketPlayers.slice(marketPage*MARKET_PAGE_SIZE,(marketPage+1)*MARKET_PAGE_SIZE);
            return(<>
          <div style={{fontSize:12,color:C.textSm,marginBottom:8,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span>{marketPlayers.length}명 · {marketPage+1}/{totalPages||1} 페이지</span>
            {totalPages>1&&<div style={{display:"flex",gap:6}}>
              <button onClick={()=>setMarketPage(p=>Math.max(0,p-1))} disabled={marketPage===0} style={{padding:"4px 12px",fontSize:12,borderRadius:8,border:`1px solid ${C.border}`,background:C.surface,cursor:marketPage===0?"not-allowed":"pointer",color:marketPage===0?C.textSm:C.text,fontFamily:"inherit"}}>◀ 이전</button>
              <button onClick={()=>setMarketPage(p=>Math.min(totalPages-1,p+1))} disabled={marketPage>=totalPages-1} style={{padding:"4px 12px",fontSize:12,borderRadius:8,border:`1px solid ${C.border}`,background:C.surface,cursor:marketPage>=totalPages-1?"not-allowed":"pointer",color:marketPage>=totalPages-1?C.textSm:C.text,fontFamily:"inherit"}}>다음 ▶</button>
            </div>}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:10}}>
            {pageSlice.map(p=>{
              const owned=squadIdSet.has(p.id);
              const realVal=getMarketVal(p);
              const canAfford=budget>=realVal*0.65;
              const ageColor=p.age<=22?"#7c3aed":p.age<=27?C.success:p.age<=30?C.warn:p.age<=33?"#ea580c":C.danger;
              return(
                <div key={p.id} style={{padding:"14px",borderRadius:12,border:`1.5px solid ${p.bubble?"#fde68a":p.leave?"#bbf7d0":C.border}`,background:C.surface,boxShadow:"0 1px 4px rgba(0,0,0,0.05)"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}>
                        <ClubLogo teamId={p.club} size={18}/>
                        <span style={{fontWeight:700,fontSize:13,color:C.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.isIcon?"👑 ":""}{p.name}</span>
                      </div>
                      <div style={{display:"flex",gap:4,flexWrap:"wrap",alignItems:"center"}}>
                        <span style={{fontSize:11,background:C.bg,color:C.textMd,padding:"2px 7px",borderRadius:6,fontWeight:700}}>{p.pos}</span>
                        <span style={{fontSize:11,background:`${ageColor}18`,color:ageColor,padding:"2px 7px",borderRadius:6,fontWeight:700,border:`1px solid ${ageColor}44`}}>{p.age}세</span>
                        <span style={{fontSize:10,color:C.textSm}}>{p.nat}</span>
                      </div>
                      <div style={{display:"flex",gap:4,alignItems:"center",marginTop:3}}>
                        <span style={{fontSize:11,color:C.textSm}}>{teamNameMap[p.club]||"🆓 자유계약"}</span>
                        {p.contract!==undefined&&p.contract<=1&&<span style={{fontSize:9,padding:"1px 5px",borderRadius:3,background:"#fef3c7",color:"#92400e",border:"1px solid #fde68a",fontWeight:700}}>⏰ 계약{p.contract}년</span>}
                      </div>
                    </div>
                    <div style={{width:44,height:44,borderRadius:"50%",background:getPlayerAvatar(p.pos),display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:16,color:"#fff",flexShrink:0,boxShadow:"0 2px 8px rgba(0,0,0,0.18)",marginLeft:8}}>{p.rat}</div>
                  </div>
                  <div style={{display:"flex",gap:3,flexWrap:"wrap",marginBottom:8}}>
                    {p.isIcon&&<span style={{fontSize:10,background:"#fef9c3",color:"#854d0e",padding:"2px 7px",borderRadius:10,border:"1px solid #fde68a",fontWeight:700}}>👑 아이콘</span>}
                    {p.bubble&&<span style={{fontSize:10,background:C.warnLt,color:C.warn,padding:"2px 7px",borderRadius:10,border:`1px solid #fde68a`}}>⚠️ 거품</span>}
                    {p.leave&&<span style={{fontSize:10,background:C.successLt,color:C.success,padding:"2px 7px",borderRadius:10,border:"1px solid #bbf7d0"}}>이적희망</span>}
                    {p.inj>=7&&<span style={{fontSize:10,background:C.dangerLt,color:C.danger,padding:"2px 7px",borderRadius:10,border:"1px solid #fca5a5"}}>🩹 부상위험</span>}
                    {p.age>=32&&<span style={{fontSize:10,background:C.bg,color:C.textMd,padding:"2px 7px",borderRadius:10,border:`1px solid ${C.border}`}}>노장</span>}
                  </div>
                  <div style={{display:"flex",gap:3,fontSize:11,marginBottom:10}}>
                    {[["속",p.pace],["슈",p.sho],["패",p.pas],["드",p.dri],["수",p.def],["체",p.phy]].map(([k,v])=>(
                      <div key={k} style={{flex:1,background:C.bg,padding:"3px 4px",borderRadius:6,textAlign:"center",border:`1px solid ${C.border}`}}>
                        <div style={{color:C.textSm,fontSize:9}}>{k}</div>
                        <div style={{fontWeight:700,color:C.text,fontSize:12}}>{v}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",borderTop:`1px solid ${C.bg}`,paddingTop:10}}>
                    <div>
                      <div style={{fontSize:16,fontWeight:800,color:canAfford?C.text:C.danger,letterSpacing:"-0.3px"}}>{fmt(realVal)}</div>
                      <div style={{fontSize:10,color:C.textSm,marginTop:1}}>€{p.wage}M/주 · 명성 {p.fame}</div>
                    </div>
                    {!owned?(
                      hijackedPlayers.has(p.id)?
                        <span style={{fontSize:11,color:C.danger,fontWeight:600}}>🚫 하이재킹됨</span>:
                        (()=>{
                        const iconFull=p.isIcon&&squad.filter(s=>s.isIcon).length>=3;
                            const clubTeamPres=ALL_TEAMS.find(t=>t.id===p.club)?.prestige||0;
                            const rejectHint=p.club&&!p.leave?clubTeamPres>=9?"🔴 거절 가능성 높음":clubTeamPres>=7?"🟡 협상 어려움":"🟢 협상 가능":null;
                            const buyoutVal=parseFloat((realVal*(p.leave?1.2:1.5)*(p.bubble?1.35:1.0)).toFixed(1));
                            const cappedBuyout=p.isIcon?Math.min(buyoutVal,6000):buyoutVal;
                            const canBuyout=budget>=cappedBuyout&&!iconFull&&p.club!=="";
                            return <div style={{textAlign:"right"}}>
                              {rejectHint&&<div style={{fontSize:9,color:clubTeamPres>=9?C.danger:clubTeamPres>=7?C.warn:C.success,marginBottom:3,fontWeight:600}}>{rejectHint}</div>}
                              <div style={{display:"flex",gap:4,justifyContent:"flex-end",flexWrap:"wrap"}}>
                                <button onClick={()=>{if(iconFull){notify('👑 아이콘 선수는 팀 내 최대 3명까지만 보유 가능합니다','error');return;}setTTarget(p);setTOffer(Math.round(realVal));setTOfferInput(String(Math.round(realVal)));setShowNeg(true);}} style={{...BTN_PRIMARY,padding:'6px 12px',fontSize:11,opacity:(canAfford&&!iconFull)?1:0.4,cursor:(canAfford&&!iconFull)?'pointer':'not-allowed',borderRadius:16}}>{iconFull?'👑한도':'협상'}</button>
                                {p.club!==""&&<button onClick={()=>{if(iconFull){notify('👑 아이콘 선수는 팀 내 최대 3명까지만 보유 가능합니다','error');return;}if(!canBuyout){notify(`바이아웃 불가 — ${fmt(cappedBuyout)} 필요`,'error');return;}if(cappedBuyout>budget){notify('예산 초과!','error');return;}const cappedWage=p.isIcon?20:getCappedWage(p.wage,contractYears);setBudget(prev=>parseFloat((prev-cappedBuyout).toFixed(1)));addNews(`💥 ${p.name} 바이아웃! ${fmt(cappedBuyout)} 즉시 영입`,"drama");finalizeTransfer(p,cappedBuyout,cappedWage,contractYears);}} style={{...BTN_DANGER,padding:'6px 10px',fontSize:10,opacity:canBuyout?1:0.35,cursor:canBuyout?'pointer':'not-allowed',borderRadius:16}}>💥{fmt(cappedBuyout)}</button>}
                              </div>
                            </div>;
                          })()
                    ):<span style={{fontSize:12,color:C.success,fontWeight:700}}>✓ 보유중</span>}
                  </div>
                  {/* 임대 / 사전계약 버튼 */}
                  {!owned&&!squadIdSet.has(p.id)&&(
                    <div style={{display:"flex",gap:4,marginTop:6,paddingTop:6,borderTop:`1px solid ${C.bg}`}}>
                      <button onClick={()=>{setLoanTarget(p);setLoanWageSplit(50);setShowLoanModal(true);}} style={{flex:1,padding:"5px 4px",borderRadius:6,border:"1px solid #bfdbfe",background:"#eff6ff",cursor:"pointer",fontFamily:"inherit",fontSize:10,color:"#1e40af",fontWeight:600}}>📋 임대 영입</button>
                      {p.club!==""&&squad.length<30&&p.contractEndSeason&&p.contractEndSeason-season<=1&&(
                        <button onClick={()=>{
                          const signingBonus=Math.round(getMarketVal(p)*0.15);
                          if(budget<signingBonus){notify(`사이닝 보너스 ${fmt(signingBonus)} 부족`,"error");return;}
                          setBudget(prev=>parseFloat((prev-signingBonus).toFixed(1)));
                          setPreContractPlayers(prev=>[...prev,{player:p,signingBonus,startSeason:season+1}]);
                          addNews(`📝 ${p.name} 사전계약! 사이닝 보너스 ${fmt(signingBonus)}`,"transfer");
                          notify(`${p.name} 사전계약!`,"success");
                        }} style={{flex:1,padding:"5px 4px",borderRadius:6,border:"1px solid #fde68a",background:"#fefce8",cursor:"pointer",fontFamily:"inherit",fontSize:10,color:"#92400e",fontWeight:600}}>📝 사전계약</button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
            {pageSlice.length===0&&<div style={{gridColumn:"1/-1",color:C.textSm,fontSize:13,padding:"3rem",textAlign:"center",background:C.surface,borderRadius:12,border:`1px dashed ${C.border}`}}>검색 조건에 맞는 선수가 없습니다</div>}
          </div>
          </>);})()}
          </>
          }
        </div>
      )}
      {/* ── 컵 대회 ── */}
      {tab==="컵 대회"&&(
        <div>
          <div style={{fontWeight:700,marginBottom:4,fontSize:15}}>🏆 컵 대회</div>
          <div style={{fontSize:12,color:C.textSm,marginBottom:12}}>4강 진출 시 예산 보너스 · 우승 시 예산 & 연봉한도 영구 증가 · 컵 경기는 <strong>무승부 없음</strong> (연장/승부차기)</div>
          {/* 현재 순위 요약 */}
          <div style={{padding:"10px 14px",background:"#eff6ff",border:"1px solid #bfdbfe",borderRadius:10,fontSize:13,color:"#1e40af",marginBottom:12,display:"flex",gap:16,flexWrap:"wrap"}}>
            <span>📊 현재 순위: <strong>{myPos}위</strong></span>
            <span>경기 수: <strong>{sortedTable.find(r=>r.id===selTeam?.id)?.p||0}경기</strong></span>
            <span style={{color:"#64748b",fontSize:11}}>※ 순위 조건은 첫 경기 시작 시 판정</span>
          </div>
          {wonTrophies.length>0&&<div style={{padding:"10px 14px",background:"#fefce8",border:"1px solid #fde68a",borderRadius:10,fontSize:13,color:"#854d0e",marginBottom:"1rem"}}>🏆 보유 트로피: {wonTrophies.map(t=>`${t.icon}${t.name}`).join(" · ")}</div>}
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:12}}>
            {Object.entries(CUPS).map(([cupId,cup])=>{
              const cp=cupProgress[cupId]||{round:1,active:true};
              const roundNames=["16강","8강","준결승","결승"];
              const currentRound=roundNames[Math.min(cp.round-1,3)];
              const wonHistory=wonTrophies.filter(t=>t.id===cupId);
              const won=wonHistory.find(t=>t.season===season);
              const myGames=sortedTable.find(r=>r.id===selTeam?.id)?.p||0;
              // ── 1. 리그 제한 판정 ──
              const leagueOk=!cup.leagueRestrict||cup.leagueRestrict.includes(selLeague);
              // ── 2. 순위 조건 판정 ──
              const hasRankLimit=!!cup.qualifyRank;
              // 판정 경기수 미달이면 → 아직 출전 불가 (더 이상 관대하게 봐주지 않음)
              const isPending=hasRankLimit&&myGames<cup.qualifyMinGames;
              // isPending이면 아직 자격 미충족 처리
              const rankOk=!hasRankLimit||(isPending?false:myPos<=cup.qualifyRank);
              // ── 3. UCL/UEL/UECL 중복 방지: 더 높은 유럽 대회 출전 중이면 하위 대회 잠금 ──
              const euroOrder=["champions_league","europa_league","conference_league"];
              const myEuroIdx=euroOrder.indexOf(cupId);
              const blockedByHigherEuro=myEuroIdx>0&&euroOrder.slice(0,myEuroIdx).some(higherCupId=>{
                const hcp=cupProgress[higherCupId]||{round:1,active:true};
                return hcp.active&&hcp.round>1; // 상위 대회에서 이미 진출 중
              });
              // ── 4. 종합 자격 판정 ──
              const alreadyStarted=cp.round>1;
              // 이미 진출 중인 경우는 계속 진행 허용
              const isFullyQualified=leagueOk&&rankOk&&!blockedByHigherEuro;
              const canPlay=cp.active&&!won&&(alreadyStarted||isFullyQualified);
              // ── 5. 차단 사유 결정 (여러 개면 가장 중요한 것만) ──
              const blockReason=won?"우승"
                :!cp.active?"탈락"
                :alreadyStarted?null
                :!leagueOk?`리그 제한 (${cup.leagueRestrictDesc})`
                :blockedByHigherEuro?`상위 UEFA 대회 진출 중 (중복 참가 불가)`
                :isPending?`순위 판정 대기 (${myGames}/${cup.qualifyMinGames}경기)`
                :!rankOk?`순위 미충족 — 현재 ${myPos}위 (필요: ${cup.qualifyRank}위 이내)`
                :null;
              // ── 배지 색상 ──
              const qualBadge=won?{c:"#854d0e",bg:"#fefce8",bd:"#fde68a",t:"🏆 우승"}
                :alreadyStarted?{c:"#16a34a",bg:"#f0fdf4",bd:"#bbf7d0",t:"✅ 출전 진행중"}
                :isFullyQualified?{c:"#16a34a",bg:"#f0fdf4",bd:"#bbf7d0",t:"✅ 출전 자격"}
                :isPending?{c:"#d97706",bg:"#fefce8",bd:"#fde68a",t:"⏳ 판정 대기"}
                :{c:"#dc2626",bg:"#fff5f5",bd:"#fecaca",t:"🔒 출전 불가"};
              return(
                <div key={cupId} style={{padding:"14px 16px",borderRadius:10,border:`1.5px solid ${won?"#fde68a":!cp.active?"#e2e8f0":canPlay?"#bfdbfe":"#fecaca"}`,background:!leagueOk||(!alreadyStarted&&!rankOk&&!isPending)?(!alreadyStarted&&!isFullyQualified&&!won?"#fff8f8":"#fff"):"#fff"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                    <div>
                      <div style={{fontSize:26,marginBottom:2}}>{cup.icon}</div>
                      <div style={{fontWeight:700,fontSize:14}}>{cup.name}</div>
                      <div style={{fontSize:10,color:C.textSm,marginTop:1}}>{cup.short}</div>
                    </div>
                    <div style={{display:"flex",flexDirection:"column",gap:4,alignItems:"flex-end"}}>
                      {!won&&cp.active&&<span style={{fontSize:11,background:"#eff6ff",color:"#2563eb",padding:"4px 10px",borderRadius:20,border:"1px solid #bfdbfe"}}>{currentRound}</span>}
                      {!won&&!cp.active&&<span style={{fontSize:11,background:C.bg,color:C.textSm,padding:"4px 10px",borderRadius:20}}>탈락</span>}
                      <span style={{fontSize:10,background:qualBadge.bg,color:qualBadge.c,padding:"3px 8px",borderRadius:12,border:`1px solid ${qualBadge.bd}`,fontWeight:600}}>{qualBadge.t}</span>
                    </div>
                  </div>
                  {/* 출전 조건 카드들 */}
                  <div style={{display:"flex",flexDirection:"column",gap:4,marginBottom:10}}>
                    {/* 리그 조건 */}
                    <div style={{display:"flex",alignItems:"center",gap:6,padding:"5px 9px",background:leagueOk?"#f0fdf4":"#fff5f5",borderRadius:6,border:`1px solid ${leagueOk?"#bbf7d0":"#fecaca"}`}}>
                      <span style={{fontSize:14}}>{leagueOk?"✅":"🚫"}</span>
                      <div style={{flex:1}}>
                        <span style={{fontSize:11,fontWeight:600,color:leagueOk?"#166534":"#dc2626"}}>{cup.leagueRestrictDesc||"전 리그 참가"}</span>
                        {!leagueOk&&<div style={{fontSize:10,color:C.danger,marginTop:1}}>현재 리그: {LEAGUES[selLeague]?.name} — 이 대회 참가 불가</div>}
                      </div>
                    </div>
                    {/* 순위 조건 */}
                    {hasRankLimit&&(
                      <div style={{display:"flex",alignItems:"center",gap:6,padding:"5px 9px",background:alreadyStarted?"#f0fdf4":rankOk?"#f0fdf4":isPending?"#fefce8":"#fff5f5",borderRadius:6,border:`1px solid ${alreadyStarted?"#bbf7d0":rankOk?"#bbf7d0":isPending?"#fde68a":"#fecaca"}`}}>
                        <span style={{fontSize:14}}>{alreadyStarted?"✅":rankOk?"✅":isPending?"⏳":"❌"}</span>
                        <div style={{flex:1}}>
                          <span style={{fontSize:11,fontWeight:600,color:alreadyStarted?"#166534":rankOk?"#166534":isPending?"#92400e":"#dc2626"}}>{cup.qualifyDesc}</span>
                          <div style={{fontSize:10,color:C.textSm,marginTop:1}}>
                            {alreadyStarted?"이미 출전 중 — 계속 진행 가능"
                              :isPending?`아직 ${cup.qualifyMinGames - myGames}경기 더 필요 (현재 ${myGames}/${cup.qualifyMinGames}경기)`
                              :rankOk?`현재 ${myPos}위 ✓`
                              :`현재 ${myPos}위 — ${cup.qualifyRank}위 이내 필요`}
                          </div>
                        </div>
                      </div>
                    )}
                    {/* UCL 진출 중 → UEL/UECL 잠금 */}
                    {blockedByHigherEuro&&!alreadyStarted&&(
                      <div style={{display:"flex",alignItems:"center",gap:6,padding:"5px 9px",background:"#fff5f5",borderRadius:6,border:"1px solid #fecaca"}}>
                        <span style={{fontSize:14}}>🚫</span>
                        <span style={{fontSize:11,fontWeight:600,color:C.danger}}>상위 UEFA 대회 참가 중 — 중복 출전 불가</span>
                      </div>
                    )}
                  </div>
                  <div style={{background:C.bg,padding:"7px 10px",borderRadius:7,marginBottom:10,fontSize:11,color:"#555",border:`1px solid ${C.border}`}}>{cup.desc}</div>
                  {wonHistory.length>0&&<div style={{fontSize:11,color:"#a16207",marginBottom:8}}>🏆 역대 우승: {wonHistory.map(w=>`S${w.season}`).join(", ")}</div>}
                  {canPlay&&<button onClick={()=>playCupMatch(cupId)} style={{...BTN_PRIMARY,width:"100%",padding:"9px",fontSize:13}}>▶ {currentRound} 경기하기</button>}
                  {!cp.active&&!won&&<div style={{fontSize:12,color:C.textSm,textAlign:"center",padding:"6px"}}>이번 시즌 탈락</div>}
                  {cp.active&&!won&&!canPlay&&blockReason&&(
                    <div style={{padding:"9px 10px",background:"#fff5f5",borderRadius:8,fontSize:12,color:C.danger,textAlign:"center",fontWeight:600,border:"1px solid #fecaca"}}>
                      🔒 {blockReason}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
      {/* ── 경기 ── */}
      {tab==="경기"&&(()=>{
        const me=table.find(r=>r.id===selTeam?.id)||{p:0,w:0,d:0,l:0,gf:0,ga:0,pts:0};
        const sortedForMatch=[...table].sort((a,b)=>b.pts-a.pts||(b.gf-b.ga)-(a.gf-a.ga));
        const myPos=sortedForMatch.findIndex(r=>r.id===selTeam?.id)+1;
        const nearbyRows=sortedForMatch.slice(Math.max(0,myPos-3),Math.min(sortedForMatch.length,myPos+2));
        // 선발 선수 평점 (이번 시즌 누적)
        const startingPlayers=getStarting();
        return(
        <div>
          {/* ── 감독 모드 헤더 ── */}
          <div style={{background:`linear-gradient(135deg,#0f172a 0%,#1e3a5f 100%)`,borderRadius:14,padding:"16px 20px",marginBottom:14,color:"#fff",display:"flex",alignItems:"center",gap:16,boxShadow:"0 4px 20px rgba(15,23,42,0.3)"}}>
            <div style={{width:52,height:52,borderRadius:"50%",background:"linear-gradient(135deg,#2563eb,#7c3aed)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0,boxShadow:"0 2px 12px rgba(37,99,235,0.5)"}}>🎮</div>
            <div style={{flex:1}}>
              <div style={{fontWeight:800,fontSize:16,letterSpacing:"-0.3px"}}>감독 모드 — {selTeam?.name}</div>
              <div style={{fontSize:12,color:"#94a3b8",marginTop:2}}>{LEAGUES[selLeague]?.name} · 시즌 {season} · 주{week} / {SEASON_MATCHES}</div>
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontSize:28,fontWeight:800,color:myPos===1?"#fbbf24":myPos<=4?"#60a5fa":"#f8fafc"}}>{myPos}위</div>
              <div style={{fontSize:11,color:"#94a3b8"}}>{me.pts}승점</div>
            </div>
          </div>

          {/* ── 메인 그리드: 좌(경기 패널) / 우(순위표+평점) ── */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 320px",gap:12}}>

            {/* 좌: 경기 패널 */}
            <div style={{display:"flex",flexDirection:"column",gap:12}}>

              {/* FC온라인 감독모드 전술 카드 */}
              <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,overflow:"hidden",boxShadow:"0 1px 4px rgba(0,0,0,0.06)"}}>
                <div style={{background:"#1e293b",color:"#f8fafc",padding:"10px 16px",fontSize:13,fontWeight:700,display:"flex",alignItems:"center",gap:8}}>
                  <span>🎯</span><span>전술 선택</span>
                  <span style={{marginLeft:"auto",fontSize:11,color:"#94a3b8",fontWeight:400}}>경기 중 실시간 전환 가능</span>
                </div>
                <div style={{padding:"12px",display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
                  {[
                    {key:"press",icon:"⚡",label:"고강도 압박",desc:"ATK +15%",color:"#dc2626",bgLight:"#fff5f5",border:"#fecaca"},
                    {key:"balanced",icon:"⚖️",label:"밸런스",desc:"균형 전술",color:"#2563eb",bgLight:"#eff6ff",border:"#bfdbfe"},
                    {key:"defensive",icon:"🛡️",label:"수비 집중",desc:"DEF +18%",color:"#16a34a",bgLight:"#f0fdf4",border:"#bbf7d0"},
                  ].map(({key,icon,label,desc,color,bgLight,border})=>{
                    const sel=halfTimeChoice===key;
                    return(
                      <button key={key} onClick={()=>setHalfTimeChoice(key===halfTimeChoice?null:key)} style={{padding:"10px 6px",borderRadius:10,border:`2px solid ${sel?color:border}`,background:sel?bgLight:"#fafafa",cursor:"pointer",fontFamily:"inherit",transition:"all 0.15s",boxShadow:sel?`0 0 0 2px ${color}33`:"none"}}>
                        <div style={{fontSize:20,marginBottom:3}}>{icon}</div>
                        <div style={{fontWeight:700,fontSize:12,color:sel?color:"#111"}}>{label}</div>
                        <div style={{fontSize:10,color:sel?color:"#888",marginTop:2}}>{desc}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 선발 명단 카드 */}
              <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,overflow:"hidden",boxShadow:"0 1px 4px rgba(0,0,0,0.06)"}}>
                <div style={{background:"#1e293b",color:"#f8fafc",padding:"10px 16px",fontSize:13,fontWeight:700,display:"flex",alignItems:"center",gap:8}}>
                  <span>📋</span><span>선발 {lineup.length}명 — {formation}</span>
                  <button onClick={()=>setShowLineup(true)} style={{marginLeft:"auto",...BTN_WHITE,padding:"4px 12px",fontSize:11,background:"transparent",border:"1px solid #475569",color:"#94a3b8"}}>변경</button>
                </div>
                <div style={{padding:"10px 12px"}}>
                  <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:8}}>
                    {lineup.map(id=>{const p=squad.find(s=>s.id===id);if(!p)return null;const isInj=injured.includes(id);const pr=playerRatings[p.id];return(
                      <span key={id} style={{fontSize:11,padding:"3px 9px",borderRadius:20,background:isInj?"#fff5f5":"#eff6ff",color:isInj?"#dc2626":"#2563eb",border:`1px solid ${isInj?"#fecaca":"#bfdbfe"}`,display:"flex",alignItems:"center",gap:3}}>
                        <span style={{fontWeight:700}}>{p.name}</span>
                        <span style={{opacity:0.7}}>({p.rat})</span>
                        {pr&&pr.count>0&&<span style={{background:"#dbeafe",color:"#1d4ed8",borderRadius:10,padding:"0px 4px",fontSize:9,fontWeight:700}}>★{pr.avg}</span>}
                        {isInj&&" 🩹"}
                      </span>
                    );})}
                  </div>
                  {injured.length>0&&<div style={{borderTop:`1px solid ${C.border}`,paddingTop:8}}><div style={{fontSize:11,color:C.danger,fontWeight:600,marginBottom:4}}>🩹 부상 이탈</div><div style={{display:"flex",gap:4,flexWrap:"wrap"}}>{squad.filter(p=>injured.includes(p.id)).map(p=>(<span key={p.id} style={{fontSize:10,padding:"2px 7px",borderRadius:10,background:"#fff5f5",color:C.danger,border:"1px solid #fecaca"}}>{p.name}</span>))}</div></div>}
                </div>
              </div>

              {/* 경기 시작 / 시즌 종료 */}
              {!seasonFinished?(
                <div style={{display:"flex",flexDirection:"column",gap:8}}>
                  {/* 경기 모드 선택 */}
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                    <button onClick={()=>setMatchViewMode("2d")} style={{padding:"10px",borderRadius:10,border:`2px solid ${matchViewMode==="2d"?"#2563eb":"#e2e8f0"}`,background:matchViewMode==="2d"?"#eff6ff":"#fafafa",cursor:"pointer",fontFamily:"inherit",textAlign:"center",transition:"all 0.15s"}}>
                      <div style={{fontSize:18,marginBottom:3}}>🎮</div>
                      <div style={{fontWeight:700,fontSize:12,color:matchViewMode==="2d"?"#2563eb":"#374151"}}>2D 경기 보기</div>
                      <div style={{fontSize:10,color:matchViewMode==="2d"?"#3b82f6":"#9ca3af",marginTop:2}}>애니메이션 진행</div>
                    </button>
                    <button onClick={()=>setMatchViewMode("skip")} style={{padding:"10px",borderRadius:10,border:`2px solid ${matchViewMode==="skip"?"#7c3aed":"#e2e8f0"}`,background:matchViewMode==="skip"?"#f5f3ff":"#fafafa",cursor:"pointer",fontFamily:"inherit",textAlign:"center",transition:"all 0.15s"}}>
                      <div style={{fontSize:18,marginBottom:3}}>⚡</div>
                      <div style={{fontWeight:700,fontSize:12,color:matchViewMode==="skip"?"#7c3aed":"#374151"}}>바로 결과</div>
                      <div style={{fontSize:10,color:matchViewMode==="skip"?"#8b5cf6":"#9ca3af",marginTop:2}}>스킵 후 결과만</div>
                    </button>
                  </div>
                  <button onClick={playMatch} style={{...BTN_PRIMARY,padding:"14px",fontSize:15,fontWeight:800,borderRadius:12,width:"100%",letterSpacing:"-0.3px",boxShadow:"0 4px 16px rgba(29,78,216,0.35)",background:matchViewMode==="skip"?"linear-gradient(135deg,#7c3aed,#6d28d9)":"linear-gradient(135deg,#2563eb,#1d4ed8)"}}>
                    {matchViewMode==="skip"?"⚡":"▶"} 리그 경기 시작  <span style={{opacity:0.8,fontWeight:400,fontSize:13}}>주{week} · {table.find(r=>r.id===selTeam?.id)?.p||0}/{SEASON_MATCHES}경기</span>
                  </button>
                </div>
              ):(
                <div style={{padding:"14px 16px",background:"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:12,fontSize:14,color:"#166534",fontWeight:700,display:"flex",alignItems:"center",gap:12}}>
                  ✅ 시즌 종료!
                  <button onClick={()=>setShowSeasonEnd(true)} style={{marginLeft:"auto",...BTN_SUCCESS,padding:"8px 18px",fontSize:13}}>📊 시즌 결과 보기</button>
                </div>
              )}

              {/* 시즌 성적 */}
              <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,padding:"12px 14px",boxShadow:"0 1px 4px rgba(0,0,0,0.06)"}}>
                <div style={{fontWeight:700,fontSize:13,marginBottom:10,color:C.text}}>📈 시즌 성적</div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
                  {[["경기",me.p],["승/무/패",`${me.w}/${me.d}/${me.l}`],["득/실",`${me.gf}/${me.ga}`],["승점",me.pts]].map(([l,v])=>(
                    <div key={l} style={{background:C.bg,padding:"10px 6px",borderRadius:8,textAlign:"center",border:`1px solid ${C.border}`}}>
                      <div style={{fontSize:17,fontWeight:800,color:l==="승점"?C.primary:C.text}}>{v}</div>
                      <div style={{fontSize:10,color:C.textSm,marginTop:1}}>{l}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 우: 순위표 + 선수 평점 */}
            <div style={{display:"flex",flexDirection:"column",gap:12}}>

              {/* 미니 순위표 */}
              <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,overflow:"hidden",boxShadow:"0 1px 4px rgba(0,0,0,0.06)"}}>
                <div style={{background:"#1e293b",color:"#f8fafc",padding:"10px 14px",fontSize:13,fontWeight:700}}>📊 리그 순위</div>
                <div style={{maxHeight:260,overflowY:"auto"}}>
                  {sortedForMatch.slice(0,Math.min(10,sortedForMatch.length)).map((row,i)=>{
                    const isMe=row.id===selTeam?.id;
                    const isUCL=i<4,isRel=i>=sortedForMatch.length-3;
                    return(
                      <div key={row.id} style={{display:"grid",gridTemplateColumns:"22px 1fr 24px 24px 32px",gap:2,padding:"6px 12px",fontSize:12,background:isMe?"#eff6ff":i%2===0?"#fff":"#f8fafc",borderBottom:"1px solid #f1f5f9",borderLeft:`3px solid ${isMe?"#2563eb":isUCL?"#7c3aed":isRel?"#dc2626":"transparent"}`}}>
                        <span style={{fontWeight:700,color:isMe?"#2563eb":"#9ca3af"}}>{i+1}</span>
                        <span style={{fontWeight:isMe?700:400,color:isMe?"#1d4ed8":"#111",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{row.name}{isMe?" ★":""}</span>
                        <span style={{textAlign:"center",color:"#9ca3af"}}>{row.p}</span>
                        <span style={{textAlign:"center",color:row.gf-row.ga>0?"#16a34a":row.gf-row.ga<0?"#dc2626":"#6b7280",fontSize:10}}>{row.gf-row.ga>0?"+":""}{row.gf-row.ga}</span>
                        <span style={{textAlign:"right",fontWeight:700,color:isMe?"#2563eb":"#111"}}>{row.pts}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 선발 선수 경기 평점 */}
              <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,overflow:"hidden",boxShadow:"0 1px 4px rgba(0,0,0,0.06)"}}>
                <div style={{background:"#1e293b",color:"#f8fafc",padding:"10px 14px",fontSize:13,fontWeight:700}}>⭐ 선수 평점</div>
                <div style={{maxHeight:280,overflowY:"auto"}}>
                  {[...squad].sort((a,b)=>{const ra=playerRatings[a.id];const rb=playerRatings[b.id];return(rb?.avg||0)-(ra?.avg||0);}).slice(0,11).map((p,i)=>{
                    const pr=playerRatings[p.id];
                    const avgRating=pr&&pr.count>0?pr.avg:null;
                    const color=avgRating>=80?C.success:avgRating>=70?C.warn:avgRating?C.danger:"#9ca3af";
                    return(
                      <div key={p.id} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 12px",borderBottom:"1px solid #f1f5f9",background:i%2===0?"#fff":"#f8fafc"}}>
                        <div style={{width:26,height:26,borderRadius:"50%",background:getPlayerAvatar(p.pos),display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:800,color:"#fff",flexShrink:0}}>{p.rat}</div>
                        <div style={{flex:1,minWidth:0}}>
                          <div style={{fontSize:11,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.name}</div>
                          <div style={{fontSize:9,color:C.textSm}}>{p.pos} · {pr?.count||0}경기</div>
                        </div>
                        <div style={{fontWeight:800,fontSize:17,color,minWidth:28,textAlign:"right"}}>{avgRating||"-"}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
        );
      })()}

      {/* ── 재정 ── */}
      {tab==="재정"&&(
        <div>
          <div style={{fontWeight:700,marginBottom:12,fontSize:15}}>💰 재정 현황</div>
          {budget<0&&(
            <div style={{padding:"12px 14px",background:"#fef2f2",border:"2px solid #fca5a5",borderRadius:10,marginBottom:12,display:"flex",alignItems:"center",justifyContent:"space-between",gap:10}}>
              <div>
                <div style={{fontWeight:800,color:"#dc2626",fontSize:14}}>🚨 재정 위기 — 예산 마이너스!</div>
                <div style={{fontSize:12,color:"#991b1b",marginTop:2}}>선수 계약해지로 재정을 정상화하세요.</div>
              </div>
              <button onClick={()=>setShowReleaseModal(true)} style={{...BTN_DANGER,padding:"9px 16px",fontSize:13,flexShrink:0}}>✂️ 선수 계약해지</button>
            </div>
          )}
          {squad.reduce((s,p)=>s+p.wage,0)>(getSalaryCap(selTeam)+permWageBonus)&&budget>=0&&(
            <div style={{padding:"10px 14px",background:"#fff7ed",border:"1.5px solid #fdba74",borderRadius:10,marginBottom:12,display:"flex",alignItems:"center",justifyContent:"space-between",gap:10}}>
              <div>
                <div style={{fontWeight:700,color:"#ea580c",fontSize:13}}>⚠️ 연봉상한선 초과 중</div>
                <div style={{fontSize:11,color:"#9a3412",marginTop:2}}>시즌 종료 시 벌금 €1000M 부과!</div>
              </div>
              <button onClick={()=>setShowReleaseModal(true)} style={{...BTN_DANGER,padding:"7px 14px",fontSize:12,flexShrink:0}}>✂️ 계약해지</button>
            </div>
          )}

          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
            <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:10,padding:"1rem"}}>
              <div style={{fontWeight:700,marginBottom:8}}>예산</div>
              <div style={{fontSize:26,fontWeight:700,color:budget>100?"#16a34a":"#dc2626"}}>{fmt(budget)}</div>
              <div style={{fontSize:12,color:C.textSm,marginTop:2}}>기본 한도: {fmt(budgetBase)} + 보너스 {fmt(permBudgetBonus)}</div>
              <div style={{marginTop:10}}>
                <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:4}}><span>연봉 {fmt(squad.reduce((s,p)=>s+p.wage,0))}/{fmt(getSalaryCap(selTeam)+permWageBonus)}</span></div>
                <div style={{height:8,background:"#e5e7eb",borderRadius:4}}><div style={{height:8,background:squad.reduce((s,p)=>s+p.wage,0)/(getSalaryCap(selTeam)+permWageBonus)>0.9?"#dc2626":"#16a34a",borderRadius:4,width:`${Math.min(100,(squad.reduce((s,p)=>s+p.wage,0)/(getSalaryCap(selTeam)+permWageBonus))*100).toFixed(0)}%`}} /></div>
              </div>
              <div style={{marginTop:8,fontSize:12}}>FFP: <span style={{color:budget>=0?"#16a34a":"#dc2626",fontWeight:600}}>{budget>=0?"✓ 준수":"⚠️ 위반 위험"}</span></div>
            </div>
            <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:10,padding:"1rem"}}>
              <div style={{fontWeight:700,marginBottom:8}}>이적 기록</div>
              <div style={{fontSize:13,color:C.danger,marginBottom:3}}>지출: {fmt(tLog.filter(t=>t.type==="buy").reduce((s,t)=>s+t.fee,0))}</div>
              <div style={{fontSize:13,color:C.success,marginBottom:10}}>수입: {fmt(tLog.filter(t=>t.type==="sell").reduce((s,t)=>s+t.fee,0))}</div>
              <div style={{borderTop:"1px solid #e2e8f0",paddingTop:8}}>
                {tLog.slice(-8).reverse().map((t,i)=>(<div key={i} style={{fontSize:11,color:C.textSm,marginBottom:3}}>{t.type==="buy"?"🟢":"🔴"} {t.player} {fmt(t.fee)} S{t.season}W{t.week}</div>))}
              </div>
            </div>
          </div>
        </div>
      )}
      {/* ── 뉴스 ── */}
      {tab==="뉴스"&&(
        <div>
          <div style={{fontWeight:800,fontSize:16,marginBottom:12,color:C.text}}>뉴스피드</div>
          {news.map(n=>{
            const typeStyle={
              drama:{bg:C.dangerLt,border:"#fca5a5",color:C.danger},
              fan:{bg:C.dangerLt,border:"#fca5a5",color:C.danger},
              injury:{bg:C.warnLt,border:"#fcd34d",color:C.warn},
              fake:{bg:C.warnLt,border:"#fcd34d",color:C.warn},
              trophy:{bg:"#fefce8",border:"#fde68a",color:"#92400e"},
              transfer:{bg:C.successLt,border:"#bbf7d0",color:C.success},
            }[n.type]||{bg:C.surface,border:C.border,color:C.text};
            return(
              <div key={n.id} style={{padding:"11px 14px",marginBottom:6,borderRadius:10,border:`1px solid ${typeStyle.border}`,background:typeStyle.bg,display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8}}>
                <div style={{fontSize:13,color:typeStyle.color,lineHeight:1.5,flex:1}}>{n.msg}</div>
                <div style={{fontSize:10,color:C.textSm,flexShrink:0,marginTop:2}}>S{n.season}·{n.week}주</div>
              </div>
            );
          })}
          {news.length===0&&<div style={{color:C.textSm,fontSize:13,padding:"2rem",textAlign:"center",background:C.surface,borderRadius:12,border:`1px dashed ${C.border}`}}>아직 뉴스가 없습니다</div>}
        </div>
      )}
      {/* ── 순위표 ── */}
      {tab==="순위표"&&(
        <div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <div>
              <span style={{fontWeight:800,fontSize:16,color:C.text}}>리그 순위표</span>
              <span style={{fontSize:13,color:C.textSm,marginLeft:8}}>{LEAGUES[selLeague]?.name}</span>
            </div>
            <div style={{fontSize:12,color:C.textSm,background:C.bg,padding:"4px 12px",borderRadius:20,border:`1px solid ${C.border}`}}>{table.find(r=>r.id===selTeam?.id)?.p||0}/{SEASON_MATCHES} 라운드</div>
          </div>
          {(()=>{
            const me=sortedTable.find(r=>r.id===selTeam?.id);
            const leader=sortedTable[0];
            if(me&&leader&&me.id!==leader.id&&leader.pts-me.pts<=6&&sortedTable.findIndex(r=>r.id===selTeam?.id)<4){
              return <div style={{padding:"11px 16px",background:C.warnLt,border:"1px solid #fde68a",borderRadius:10,marginBottom:12,fontSize:13,color:"#92400e",fontWeight:700}}>🔥 타이틀 경쟁 중! {leader.name}과 승점 {leader.pts-me.pts}차 — 역전 가능!</div>;
            }
            if(me&&me.pts-((sortedTable[sortedTable.length-3]||{}).pts||0)<=4){
              return <div style={{padding:"11px 16px",background:C.dangerLt,border:"1px solid #fca5a5",borderRadius:10,marginBottom:12,fontSize:13,color:C.danger,fontWeight:700}}>⚠️ 강등권 근접! 긴장하세요!</div>;
            }
            return null;
          })()}
          <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,overflow:"hidden",boxShadow:"0 1px 4px rgba(0,0,0,0.04)"}}>
            <div style={{display:"grid",gridTemplateColumns:"30px 1fr 40px 40px 40px 40px 50px 40px 52px",gap:0,background:C.hdrBg,color:"#94a3b8",padding:"10px 14px",fontSize:11,fontWeight:700,letterSpacing:"0.3px",textTransform:"uppercase"}}>
              <span>#</span><span>구단</span><span style={{textAlign:"center"}}>경기</span><span style={{textAlign:"center"}}>승</span><span style={{textAlign:"center"}}>무</span><span style={{textAlign:"center"}}>패</span><span style={{textAlign:"center"}}>득실</span><span style={{textAlign:"center"}}>득</span><span style={{textAlign:"center",color:"#fbbf24"}}>승점</span>
            </div>
            {sortedTable.map((row,i)=>{
              const isMe=row.id===selTeam?.id;
              const ucl=i<4,uel=i===4,conf=i===5,rel=i>=sortedTable.length-3;
              const accentColor=ucl?"#3b82f6":uel?"#f59e0b":conf?"#10b981":rel?C.danger:"transparent";
              return(
                <div key={row.id} style={{display:"grid",gridTemplateColumns:"30px 1fr 40px 40px 40px 40px 50px 40px 52px",gap:0,padding:"9px 14px",fontSize:13,background:isMe?C.primaryLt:i%2===0?C.surface:"#f8fafc",borderBottom:`1px solid ${C.bg}`,borderLeft:`4px solid ${accentColor}`}}>
                  <span style={{fontWeight:700,color:i<3?"#f59e0b":C.textSm}}>{i+1}</span>
                  <span style={{fontWeight:isMe?800:400,color:isMe?C.primary:C.text}}>{row.name}{isMe?" ★":""}</span>
                  <span style={{textAlign:"center",color:C.textSm}}>{row.p}</span>
                  <span style={{textAlign:"center",color:C.success,fontWeight:600}}>{row.w}</span>
                  <span style={{textAlign:"center",color:C.textSm}}>{row.d}</span>
                  <span style={{textAlign:"center",color:C.danger}}>{row.l}</span>
                  <span style={{textAlign:"center",color:row.gf-row.ga>0?C.success:row.gf-row.ga<0?C.danger:C.textSm,fontWeight:600}}>{row.gf-row.ga>0?"+":""}{row.gf-row.ga}</span>
                  <span style={{textAlign:"center",color:C.textSm}}>{row.gf}</span>
                  <span style={{textAlign:"center",fontWeight:800,color:isMe?C.primary:C.text,fontSize:14}}>{row.pts}</span>
                </div>
              );
            })}
          </div>
          <div style={{display:"flex",gap:16,marginTop:12,fontSize:11,color:C.textSm,flexWrap:"wrap"}}>
            {[["#3b82f6","UCL 진출"],["#f59e0b","UEL"],["#10b981","UECL"],[C.danger,"강등권"]].map(([c,l])=>(
              <span key={l} style={{display:"flex",alignItems:"center",gap:5}}><span style={{width:10,height:10,background:c,borderRadius:2,display:"inline-block"}}/>{l}</span>
            ))}
          </div>
        </div>
      )}
      {/* ── 평점 탭 ── */}
      {tab==="평점"&&(
        <div>
          <div style={{fontWeight:800,fontSize:16,marginBottom:14,color:C.text}}>선수 평점 & 컨디션</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:8}}>
            {[...squad].sort((a,b)=>{
              const ra=playerRatings[a.id];const rb=playerRatings[b.id];
              return (rb?.avg||0)-(ra?.avg||0);
            }).map((p,i)=>{
              const pr=playerRatings[p.id];
              const cond=playerConditions[p.id]??80;
              const isInj=injured.includes(p.id);
              const decline=getAgingDecline(p.age);
              return(
                <div key={p.id} style={{padding:"12px",background:C.surface,border:`1px solid ${C.border}`,borderRadius:10,boxShadow:"0 1px 3px rgba(0,0,0,0.04)"}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                    <div style={{width:34,height:34,borderRadius:"50%",background:getPlayerAvatar(p.pos),display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:13,color:"#fff",flexShrink:0}}>{p.rat}</div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontWeight:700,fontSize:13,color:isInj?C.danger:C.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{i<3?["🥇","🥈","🥉"][i]+"\u00a0":""}{p.name}{isInj?" 🩹":""}</div>
                      <div style={{fontSize:11,color:C.textSm}}>{p.pos} · {p.age}세</div>
                    </div>
                    {pr&&pr.count>0&&(
                      <div style={{fontWeight:800,fontSize:20,color:pr.avg>=80?C.success:pr.avg>=70?C.warn:C.danger,letterSpacing:"-0.5px"}}>{pr.avg}</div>
                    )}
                  </div>
                  <div style={{marginBottom:6}}>
                    <div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:C.textSm,marginBottom:3}}>
                      <span>컨디션</span><span style={{fontWeight:700,color:cond>=80?C.success:cond>=60?C.warn:C.danger}}>{cond}%</span>
                    </div>
                    <div style={{height:5,background:C.bg,borderRadius:3}}>
                      <div style={{height:"100%",width:`${cond}%`,background:cond>=80?C.success:cond>=60?"#f59e0b":C.danger,borderRadius:3}}/>
                    </div>
                  </div>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <span style={{fontSize:10,color:C.textSm}}>{pr?.count||0}경기 출전</span>
                    <div style={{display:"flex",gap:3}}>
                      {decline>0&&<span style={{fontSize:9,padding:"2px 6px",borderRadius:4,background:C.dangerLt,color:C.danger,border:"1px solid #fca5a5"}}>에이징 -{decline}</span>}
                      {p.age<=28&&<span style={{fontSize:9,padding:"2px 6px",borderRadius:4,background:C.successLt,color:C.success,border:"1px solid #bbf7d0"}}>+{getGrowthRate(p.age,season,p.pot,p.rat)}</span>}
                    </div>
                  </div>
                </div>
              );
            })}
            {squad.length===0&&<div style={{gridColumn:"1/-1",color:C.textSm,fontSize:13}}>스쿼드 없음</div>}
          </div>
        </div>
      )}

      {/* ── 통계 ── */}
      
      {tab==="구단 시설"&&(
        <div>
          <div style={{fontWeight:800,fontSize:16,marginBottom:4}}>🏗️ 구단 시설 관리</div>
          <div style={{fontSize:12,color:C.textSm,marginBottom:14}}>시설 레벨을 올리면 매 시즌 유지비가 발생하지만 팀 전체에 효과가 적용됩니다.</div>
          {/* 이사회 목표 */}
          <div style={{padding:"12px 14px",background:boardObjective?"#f0fdf4":"#f8fafc",border:`1.5px solid ${boardObjective?"#bbf7d0":"#e2e8f0"}`,borderRadius:10,marginBottom:14}}>
            <div style={{fontWeight:700,fontSize:14,marginBottom:6}}>📋 이사회 목표</div>
            {boardObjective?(
              <div style={{fontSize:13,color:"#166534"}}>
                {boardObjective.type==="rank"?`리그 ${boardObjective.target}위 이내 달성`:boardObjective.type==="cup"?"컵 대회 우승":"목표 달성"} — 보너스 <strong>€{boardObjective.bonus}M</strong>
              </div>
            ):(
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                {[{type:"rank",target:1,bonus:80,label:"🥇 리그 우승"},{type:"rank",target:4,bonus:40,label:"🏆 UCL 진출(4위)"},{type:"rank",target:6,bonus:20,label:"📈 6위 이내"},{type:"cup",target:null,bonus:50,label:"🏆 컵 우승"}].map(obj=>(
                  <button key={obj.label} onClick={()=>{setBoardObjective({...obj,deadline:season});addNews(`📋 이사회 목표 설정: ${obj.label} (달성 시 +€${obj.bonus}M)`,"system");notify(`목표 설정: ${obj.label}`,"success");}} style={{padding:"8px 14px",borderRadius:8,border:"1px solid #e2e8f0",background:"#fff",cursor:"pointer",fontFamily:"inherit",fontSize:12}}>
                    {obj.label} <span style={{color:"#16a34a",fontWeight:700}}>+€{obj.bonus}M</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          {/* 스폰서 */}
          <div style={{padding:"12px 14px",background:sponsorContract?"#eff6ff":"#f8fafc",border:`1.5px solid ${sponsorContract?"#bfdbfe":"#e2e8f0"}`,borderRadius:10,marginBottom:14}}>
            <div style={{fontWeight:700,fontSize:14,marginBottom:6}}>🤝 유니폼 스폰서</div>
            {sponsorContract?(
              <div style={{fontSize:13,color:"#1e40af"}}>{sponsorContract.name} — 연간 <strong>€{sponsorContract.annual}M</strong> 수익</div>
            ):(
              <div>
                <div style={{fontSize:12,color:C.textSm,marginBottom:8}}>팬 지지도와 리그 순위에 따라 오퍼 금액이 달라집니다.</div>
                {(()=>{
                  const baseAnnual=Math.round(fanApproval*0.4+selTeam?.prestige*3+(myPos<=4?15:myPos<=8?8:3));
                  const sponsors=["나이키","아디다스","퓨마","험멜","뉴발란스"].slice(0,3);
                  return(<div style={{display:"flex",gap:8}}>
                    {sponsors.map((s,i)=>{const annual=Math.round(baseAnnual*(0.85+i*0.15));return(
                      <button key={s} onClick={()=>{setSponsorContract({name:s,annual});addNews(`🤝 ${s} 스폰서 계약 체결! 연간 €${annual}M`,"system");notify(`${s} 스폰서 계약!`,"success");}} style={{flex:1,padding:"8px",borderRadius:8,border:"1px solid #bfdbfe",background:"#eff6ff",cursor:"pointer",fontFamily:"inherit",fontSize:12}}>
                        {s}<br/><strong>€{annual}M/시즌</strong>
                      </button>
                    );})}
                  </div>);
                })()}
              </div>
            )}
          </div>
          {/* 시설 레벨 카드들 */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:10}}>
            {[
              {key:"training",icon:"⚽",name:"훈련 시설",effect:"유스 성장률 +10%/레벨, 컨디션 회복 속도 +5%",costPerLevel:30},
              {key:"medical",icon:"🏥",name:"의료 센터",effect:"부상 기간 -15%/레벨, 컨디션 회복 +8%",costPerLevel:25},
              {key:"scout",icon:"🔭",name:"스카우트 네트워크",effect:"이적시장 특수 선수 등장 확률 +10%/레벨",costPerLevel:20},
              {key:"stadium",icon:"🏟️",name:"홈구장",effect:"팬 수익 배율 +25%/레벨, 홈어드밴티지 +3%",costPerLevel:40},
            ].map(({key,icon,name,effect,costPerLevel})=>{
              const lv=facilityLevels[key]||1;
              const maintCost=(lv-1)*costPerLevel*0.5;
              const upgradeCost=lv<3?lv*costPerLevel:null;
              return(
                <div key={key} style={{padding:"14px",borderRadius:12,border:`1.5px solid ${lv>=3?"#fde68a":lv>=2?"#bfdbfe":"#e2e8f0"}`,background:lv>=3?"#fefce8":lv>=2?"#eff6ff":"#fff"}}>
                  <div style={{fontWeight:700,fontSize:14,marginBottom:4}}>{icon} {name}</div>
                  <div style={{display:"flex",gap:4,marginBottom:8}}>
                    {[1,2,3].map(l=><div key={l} style={{flex:1,height:6,borderRadius:3,background:lv>=l?"#2563eb":"#e2e8f0"}}/>)}
                  </div>
                  <div style={{fontSize:11,color:C.textSm,marginBottom:6,lineHeight:1.5}}>Lv{lv} — {effect}</div>
                  {maintCost>0&&<div style={{fontSize:10,color:C.warn,marginBottom:6}}>유지비: €{maintCost}M/시즌</div>}
                  {upgradeCost?(
                    <button onClick={()=>{
                      if(budget<upgradeCost){notify(`예산 부족! €${upgradeCost}M 필요`,"error");return;}
                      setBudget(prev=>parseFloat((prev-upgradeCost).toFixed(1)));
                      setFacilityLevels(prev=>({...prev,[key]:lv+1}));
                      addNews(`🏗️ ${name} Lv${lv}→Lv${lv+1} 업그레이드 완료 (€${upgradeCost}M)`,"system");
                      notify(`${name} 업그레이드!`,"success");
                    }} style={{...BTN_PRIMARY,width:"100%",padding:"8px",fontSize:12}}>
                      ⬆️ Lv{lv+1}로 업그레이드 — €{upgradeCost}M
                    </button>
                  ):(
                    <div style={{textAlign:"center",fontSize:12,color:"#d97706",fontWeight:700}}>✨ 최고 레벨</div>
                  )}
                </div>
              );
            })}
          </div>
          {/* 세트피스 훈련 */}
          <div style={{marginTop:14,padding:"14px",borderRadius:12,border:"1.5px solid #e2e8f0",background:"#fff"}}>
            <div style={{fontWeight:700,fontSize:14,marginBottom:6}}>🎯 세트피스 훈련 (Lv{setpieceLevel}/3)</div>
            <div style={{fontSize:12,color:C.textSm,marginBottom:8}}>레벨 높을수록 코너킥/프리킥 득점 확률이 상승합니다. (현재 +{setpieceLevel*8}%)</div>
            <div style={{display:"flex",gap:4,marginBottom:10}}>
              {[1,2,3].map(l=><div key={l} style={{flex:1,height:6,borderRadius:3,background:setpieceLevel>=l?"#16a34a":"#e2e8f0"}}/>)}
            </div>
            {setpieceLevel<3&&(
              <button onClick={()=>{const cost=(setpieceLevel+1)*15;if(budget<cost){notify(`예산 부족! €${cost}M 필요`,"error");return;}setBudget(prev=>parseFloat((prev-cost).toFixed(1)));setSetpieceLevel(prev=>prev+1);addNews(`🎯 세트피스 훈련 Lv${setpieceLevel+1} 달성!`,"system");notify("세트피스 훈련 레벨 업!","success");}} style={{...BTN_SUCCESS,padding:"8px 16px",fontSize:12}}>
                ⬆️ Lv{setpieceLevel+1}로 향상 — €{(setpieceLevel+1)*15}M
              </button>
            )}
          </div>
          {/* 기자회견 */}
          <div style={{marginTop:14,padding:"14px",borderRadius:12,border:"1.5px solid #e2e8f0",background:"#fff"}}>
            <div style={{fontWeight:700,fontSize:14,marginBottom:6}}>🎙️ 기자회견</div>
            <div style={{fontSize:12,color:C.textSm,marginBottom:10}}>발언 스타일에 따라 팬 지지도와 선수 사기에 영향을 줍니다.</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
              {[
                {label:"💪 자신감 발언",fan:+5,morale:+8,desc:"팬들이 열광하지만 압박감 상승"},
                {label:"🤝 겸손한 발언",fan:+2,morale:+3,desc:"균형 잡힌 분위기 유지"},
                {label:"⚡ 압박 발언",fan:-2,morale:-5,desc:"단기 집중력 상승, 장기 사기 하락"},
              ].map(({label,fan,morale,desc})=>(
                <button key={label} onClick={()=>{
                  setFanApproval(prev=>Math.min(100,Math.max(0,prev+fan)));
                  setPlayerMorale(prev=>{const next={...prev};squad.forEach(p=>{next[p.id]=Math.min(100,Math.max(0,(next[p.id]||70)+morale));});return next;});
                  addNews(`🎙️ 감독 기자회견: "${label}" — 팬지지도 ${fan>0?"+":""}${fan}%, 선수 사기 ${morale>0?"+":""}${morale}`,"system");
                  notify(`기자회견 완료: ${label}`,"success");
                }} style={{padding:"10px 8px",borderRadius:8,border:"1px solid #e2e8f0",background:"#f8fafc",cursor:"pointer",fontFamily:"inherit",fontSize:11,textAlign:"center"}}>
                  <div style={{fontWeight:700,marginBottom:2}}>{label}</div>
                  <div style={{fontSize:10,color:C.textSm}}>{desc}</div>
                  <div style={{marginTop:4,fontSize:10}}>
                    <span style={{color:fan>=0?C.success:C.danger}}>팬 {fan>0?"+":""}{fan}%</span>
                    {" · "}
                    <span style={{color:morale>=0?C.primary:C.warn}}>사기 {morale>0?"+":""}{morale}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
          {/* 임대 방출 유망주 현황 */}
          {loanOutPlayers.length>0&&(
            <div style={{marginTop:14,padding:"12px 14px",background:"#eff6ff",border:"1.5px solid #bfdbfe",borderRadius:10}}>
              <div style={{fontWeight:700,fontSize:13,marginBottom:8}}>✈️ 임대 방출 유망주 현황 ({loanOutPlayers.length}명)</div>
              {loanOutPlayers.map(lo=>{
                const pres=lo.toTeam?.prestige||5;
                const startProb=pres>=9?0.25:pres>=8?0.45:pres>=7?0.60:pres>=6?0.75:0.85;
                const grade=startProb>=0.75?"주전 예상":startProb>=0.55?"로테이션":"백업 예상";
                return(
                  <div key={lo.player.id} style={{display:"flex",alignItems:"center",gap:8,marginBottom:8,padding:"8px 10px",background:"#fff",borderRadius:8,border:"1px solid #bfdbfe"}}>
                    <div style={{width:32,height:32,borderRadius:"50%",background:getPlayerAvatar(lo.player.pos),display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:12,color:"#fff",flexShrink:0}}>{lo.player.rat}</div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontWeight:700,fontSize:12}}>{lo.player.name} <span style={{fontSize:10,color:C.textSm}}>→ {lo.toTeam?.name||""}</span></div>
                      <div style={{fontSize:10,color:C.textSm}}>OVR{lo.player.rat}/POT{lo.player.pot} · {grade} · 잔여 {lo.remainSeasons}시즌</div>
                    </div>
                    <button onClick={()=>{
                      // 조기 복귀 (성장 없이) — 즉시 loanOutPlayers에서 제거
                      setLoanOutPlayers(prev=>{
                        const lo2=prev.find(p=>p.player.id===lo.player.id);
                        if(!lo2)return prev;
                        if(squad.length<30){setSquad(s=>[...s,{...lo2.player,club:selTeam.id,isLoanOut:false,remainSeasons:0}]);}
                        const pidx=ALL_PLAYERS.findIndex(p=>p.id===lo2.player.id);
                        if(pidx!==-1)ALL_PLAYERS[pidx]={...ALL_PLAYERS[pidx],club:selTeam.id};
                        addNews(`🔙 ${lo2.player.name} 임대 조기 복귀`,"transfer");
                        return prev.filter(p=>p.player.id!==lo2.player.id);
                      });
                    }} style={{fontSize:10,padding:"3px 8px",borderRadius:5,border:"1px solid #fecaca",background:"#fff5f5",cursor:"pointer",color:C.danger,flexShrink:0}}>조기복귀</button>
                  </div>
                );
              })}
            </div>
          )}
          {/* 임대 등록 선수 현황 */}
          {loanPlayers.length>0&&(
            <div style={{marginTop:14,padding:"12px 14px",background:"#f0fdf4",border:"1.5px solid #bbf7d0",borderRadius:10}}>
              <div style={{fontWeight:700,fontSize:13,marginBottom:8}}>📋 임대 선수 현황 ({loanPlayers.length}명)</div>
              {loanPlayers.map(l=>(
                <div key={l.player.id} style={{display:"flex",alignItems:"center",gap:8,marginBottom:6,fontSize:12}}>
                  <span style={{fontWeight:700}}>{l.player.name}</span>
                  <span style={{color:C.textSm}}>{l.player.pos} · {l.wageSplit}% 부담</span>
                  <span style={{color:C.success,fontWeight:600}}>€{(l.player.wage*l.wageSplit/100).toFixed(1)}M/주</span>
                  {l.buyOption&&<span style={{fontSize:10,padding:"1px 6px",borderRadius:4,background:"#eff6ff",color:"#1e40af",border:"1px solid #bfdbfe"}}>옵션바이 {fmt(l.buyOption)}</span>}
                  <button onClick={()=>{setLoanPlayers(prev=>prev.filter(p=>p.player.id!==l.player.id));setSquad(prev=>prev.filter(p=>p.id!==l.player.id));addNews(`🔄 ${l.player.name} 임대 기간 종료`,"transfer");}} style={{marginLeft:"auto",fontSize:10,padding:"2px 7px",borderRadius:4,border:"1px solid #fecaca",background:"#fff5f5",cursor:"pointer",color:C.danger}}>임대 종료</button>
                </div>
              ))}
            </div>
          )}
          {/* 사전계약 현황 */}
          {preContractPlayers.length>0&&(
            <div style={{marginTop:14,padding:"12px 14px",background:"#fefce8",border:"1.5px solid #fde68a",borderRadius:10}}>
              <div style={{fontWeight:700,fontSize:13,marginBottom:8}}>📝 사전계약 현황 ({preContractPlayers.length}명)</div>
              {preContractPlayers.map(pc=>(
                <div key={pc.player.id} style={{display:"flex",alignItems:"center",gap:8,marginBottom:6,fontSize:12}}>
                  <span style={{fontWeight:700}}>{pc.player.name}</span>
                  <span style={{color:C.textSm}}>{pc.player.pos} · OVR {pc.player.rat}</span>
                  <span style={{color:C.warn}}>S{pc.startSeason} 합류</span>
                  <span style={{color:C.success,fontWeight:600}}>사이닝 보너스 {fmt(pc.signingBonus)}</span>
                </div>
              ))}
            </div>
          )}
          {/* 멘토링 페어 */}
          <div style={{marginTop:14,padding:"14px",borderRadius:12,border:"1.5px solid #e2e8f0",background:"#fff"}}>
            <div style={{fontWeight:700,fontSize:14,marginBottom:6}}>🧑‍🏫 멘토링 시스템</div>
            <div style={{fontSize:12,color:C.textSm,marginBottom:10}}>노장(30세+ OVR85+)을 유망주(21세- pot85+)와 페어링하면 시즌 중 성장이 가속됩니다.</div>
            {(()=>{
              const mentors=squad.filter(p=>p.age>=30&&p.rat>=85);
              const students=squad.filter(p=>p.age<=21&&p.pot>=80);
              return(<>
                {mentoringPairs.length>0&&(
                  <div style={{marginBottom:10}}>
                    {mentoringPairs.map(pair=>{
                      const m=squad.find(p=>p.id===pair.mentorId),s=squad.find(p=>p.id===pair.studentId);
                      if(!m||!s)return null;
                      return(<div key={pair.mentorId+pair.studentId} style={{display:"flex",alignItems:"center",gap:8,marginBottom:4,fontSize:12,padding:"6px 10px",background:"#f0fdf4",borderRadius:8}}>
                        <span style={{fontWeight:700}}>{m.name}</span><span style={{color:C.textSm}}>→</span><span style={{fontWeight:700}}>{s.name}</span>
                        <span style={{fontSize:10,color:m.pos===s.pos?C.success:C.warn}}>{m.pos===s.pos?"같은 포지션 ✓":"다른 포지션"}</span>
                        <button onClick={()=>setMentoringPairs(prev=>prev.filter(p=>!(p.mentorId===pair.mentorId&&p.studentId===pair.studentId)))} style={{marginLeft:"auto",fontSize:10,padding:"2px 6px",borderRadius:4,border:`1px solid ${C.border}`,background:C.surface,cursor:"pointer"}}>해제</button>
                      </div>);
                    })}
                  </div>
                )}
                {mentors.length>0&&students.length>0?(
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                    <div>
                      <div style={{fontSize:11,color:C.textSm,marginBottom:4}}>멘토 선택</div>
                      {mentors.map(p=><button key={p.id} onClick={()=>{const existing=mentoringPairs.find(pair=>pair.mentorId===p.id);if(existing){const student=squad.find(s=>s.id===existing.studentId);notify(`이미 ${student?.name||""}와 페어링 중`,"error");return;}const ai=students.find(s=>s.pos===p.pos)||students[0];if(ai){setMentoringPairs(prev=>[...prev,{mentorId:p.id,studentId:ai.id}]);addNews(`🧑‍🏫 멘토링: ${p.name} → ${ai.name} (${p.pos===ai.pos?"동포지션":"이종포지션"})`,"system");notify(`멘토링 페어: ${p.name}→${ai.name}`,"success");}}} style={{display:"block",width:"100%",padding:"5px 8px",marginBottom:3,borderRadius:6,border:`1px solid ${C.border}`,background:C.surface,cursor:"pointer",fontFamily:"inherit",fontSize:11,textAlign:"left"}}>{p.name} <span style={{color:C.textSm}}>{p.pos} OVR{p.rat}</span></button>)}
                    </div>
                  </div>
                ):<div style={{fontSize:12,color:C.textSm}}>멘토링 가능한 조합이 없습니다 (멘토: 30세+ OVR85+, 학생: 21세- pot80+)</div>}
              </>);
            })()}
          </div>
          {/* 강등 위기 */}
          {showRelegationWarning&&(
            <div style={{marginTop:14,padding:"14px",background:"#fff5f5",border:"1.5px solid #fecaca",borderRadius:10}}>
              <div style={{fontWeight:700,fontSize:14,color:C.danger,marginBottom:6}}>⚠️ 강등 위기!</div>
              <div style={{fontSize:13,color:C.textMd,marginBottom:10}}>현재 순위가 강등권({sortedTable.length-2}위 이하)입니다. 리그 잔류를 위해 전력을 다하세요!</div>
              <div style={{fontSize:12,color:C.textSm,marginBottom:8}}>이사회 압박: 잔류 실패 시 예산 삭감 경고</div>
              <button onClick={()=>setShowRelegationWarning(false)} style={{...BTN_CANCEL,padding:"7px 16px",fontSize:12}}>확인</button>
            </div>
          )}
        </div>
      )}
      {tab==="통계"&&(()=>{
        // ── 시즌 연대기 (통계 탭 최상단) ──
        const hasHistory=wonTrophies.length>0||retiredLegends.length>0||ballonDorHistory.length>0;
        if(hasHistory)(()=>{})(); // trigger render
        const sorted=[...squad].sort((a,b)=>{
          const ra=playerRatings[a.id]||{goals:0,assists:0,shots:0,passAccTotal:0,intercTotal:0,count:0};
          const rb=playerRatings[b.id]||{goals:0,assists:0,shots:0,passAccTotal:0,intercTotal:0,count:0};
          if(statSort==="goals")return(rb.goals||0)-(ra.goals||0);
          if(statSort==="assists")return(rb.assists||0)-(ra.assists||0);
          if(statSort==="passAcc")return((rb.count?rb.passAccTotal/rb.count:0))-(ra.count?ra.passAccTotal/ra.count:0);
          if(statSort==="interc")return((rb.intercTotal||0)-(ra.intercTotal||0));
          if(statSort==="rating")return((rb.avg||0)-(ra.avg||0));
          return 0;
        });
        const cols=[
          {key:"goals",label:"골",icon:"⚽"},
          {key:"assists",label:"어시",icon:"🅰️"},
          {key:"passAcc",label:"패스%",icon:"🎯"},
          {key:"interc",label:"차단",icon:"✂️"},
          {key:"rating",label:"평점",icon:"⭐"},
        ];
        return(
        <div>
          <div style={{fontWeight:800,fontSize:16,marginBottom:14,color:C.text}}>📈 선수 시즌 통계</div>
          {/* 정렬 버튼 */}
          <div style={{display:"flex",gap:6,marginBottom:12,flexWrap:"wrap"}}>
            {cols.map(c=>(
              <button key={c.key} onClick={()=>setStatSort(c.key)} style={{padding:"6px 14px",borderRadius:20,border:`1.5px solid ${statSort===c.key?C.primary:C.border}`,background:statSort===c.key?C.primaryLt:"#fff",color:statSort===c.key?C.primary:C.textMd,fontWeight:statSort===c.key?700:400,cursor:"pointer",fontSize:12,fontFamily:"inherit"}}>
                {c.icon} {c.label}
              </button>
            ))}
          </div>

          {/* 통계 테이블 */}
          <div style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:12,overflow:"hidden",boxShadow:"0 1px 4px rgba(0,0,0,0.06)"}}>
            <div style={{display:"grid",gridTemplateColumns:"28px 1fr 46px 46px 46px 52px 46px",background:"#0f172a",color:"#f8fafc",padding:"8px 12px",fontSize:11,fontWeight:700,gap:2}}>
              <span>#</span>
              <span>선수</span>
              <span style={{textAlign:"center"}}>⭐평점</span>
              <span style={{textAlign:"center"}}>⚽골</span>
              <span style={{textAlign:"center"}}>🅰️어시</span>
              <span style={{textAlign:"center"}}>🎯패스%</span>
              <span style={{textAlign:"center"}}>✂️차단</span>
            </div>
            {sorted.map((p,i)=>{
              const pr=playerRatings[p.id]||{goals:0,assists:0,shots:0,passAccTotal:0,intercTotal:0,count:0};
              const avgPass=pr.count>0?Math.round(pr.passAccTotal/pr.count):null;
              const isInj=injured.includes(p.id);
              const highlight=statSort==="goals"?pr.goals:statSort==="assists"?pr.assists:statSort==="passAcc"?avgPass:statSort==="interc"?(pr.intercTotal||0):(pr.avg||0);
              return(
                <div key={p.id} style={{display:"grid",gridTemplateColumns:"28px 1fr 46px 46px 46px 52px 46px",gap:2,padding:"8px 12px",fontSize:12,background:i===0?"#fefce8":i%2===0?"#fff":"#f8fafc",borderBottom:"1px solid #f1f5f9",alignItems:"center",borderLeft:i<3?`3px solid ${i===0?"#f59e0b":i===1?"#94a3b8":"#cd7c2f"}`:"3px solid transparent"}}>
                  <span style={{fontWeight:700,color:i===0?"#d97706":i===1?"#94a3b8":i===2?"#cd7c2f":"#9ca3af",fontSize:10}}>{i+1}</span>
                  <div style={{display:"flex",alignItems:"center",gap:6,minWidth:0}}>
                    <div style={{width:24,height:24,borderRadius:"50%",background:getPlayerAvatar(p.pos),display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:700,color:"#fff",flexShrink:0}}>{p.rat}</div>
                    <div style={{minWidth:0}}>
                      <div style={{fontWeight:600,fontSize:11,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",color:isInj?C.danger:C.text}}>{p.name}{isInj?" 🩹":""}</div>
                      <div style={{fontSize:9,color:C.textSm}}>{p.pos} · {p.age}세 · {pr.count||0}경기</div>
                    </div>
                  </div>
                  <div style={{textAlign:"center",fontWeight:statSort==="rating"?800:600,color:pr.avg>=80?C.success:pr.avg>=70?C.warn:pr.avg?C.danger:"#9ca3af",fontSize:statSort==="rating"?14:12}}>{pr.avg||"-"}</div>
                  <div style={{textAlign:"center",fontWeight:statSort==="goals"?800:600,color:pr.goals>0?C.success:"#9ca3af",fontSize:statSort==="goals"?14:12}}>{pr.goals||0}</div>
                  <div style={{textAlign:"center",fontWeight:statSort==="assists"?800:600,color:pr.assists>0?C.primary:"#9ca3af",fontSize:statSort==="assists"?14:12}}>{pr.assists||0}</div>
                  <div style={{textAlign:"center",fontWeight:statSort==="passAcc"?800:600,color:avgPass>=80?C.success:avgPass>=65?C.warn:avgPass?C.danger:"#9ca3af",fontSize:statSort==="passAcc"?13:11}}>{avgPass?`${avgPass}%`:"-"}</div>
                  <div style={{textAlign:"center",fontWeight:statSort==="interc"?800:600,color:(pr.intercTotal||0)>5?C.success:(pr.intercTotal||0)>2?C.warn:"#9ca3af",fontSize:statSort==="interc"?14:12}}>{pr.intercTotal||0}</div>
                </div>
              );
            })}
            {squad.length===0&&<div style={{padding:"20px",color:C.textSm,textAlign:"center",fontSize:13}}>아직 경기 기록이 없습니다</div>}
          </div>

          {/* 팀 총계 */}
          {squad.length>0&&(()=>{
            const totGoals=squad.reduce((s,p)=>{const pr=playerRatings[p.id];return s+(pr?.goals||0);},0);
            const totAssists=squad.reduce((s,p)=>{const pr=playerRatings[p.id];return s+(pr?.assists||0);},0);
            const passVals=squad.map(p=>{const pr=playerRatings[p.id];return pr?.count>0?pr.passAccTotal/pr.count:null;}).filter(Boolean);
            const avgPassTeam=passVals.length?Math.round(passVals.reduce((a,b)=>a+b,0)/passVals.length):null;
            const totInterc=squad.reduce((s,p)=>{const pr=playerRatings[p.id];return s+(pr?.intercTotal||0);},0);
            return(
              <div style={{marginTop:12,display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
                {[["팀 총 골",totGoals,"⚽"],["팀 총 어시",totAssists,"🅰️"],["팀 평균 패스%",avgPassTeam?`${avgPassTeam}%`:"-","🎯"],["팀 총 차단",totInterc,"✂️"]].map(([l,v,icon])=>(
                  <div key={l} style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:10,padding:"10px",textAlign:"center"}}>
                    <div style={{fontSize:10,color:C.textSm,marginBottom:3}}>{icon} {l}</div>
                    <div style={{fontSize:20,fontWeight:800,color:C.primary}}>{v}</div>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
        );
      })()}
      </div>{/* end padding div */}
      {/* ══ 연봉 조정 모달 ══ */}
      {showWageAdjust&&wageAdjustTarget&&(()=>{
        const salaryCap=getSalaryCap(selTeam)+permWageBonus;
        const currentTotalWage=squad.reduce((s,p)=>s+p.wage,0);
        const projectedTotal=parseFloat((currentTotalWage-wageAdjustTarget.wage+wageAdjustAmount).toFixed(1));
        const overCap=wageAdjustAmount>wageAdjustTarget.wage&&projectedTotal>salaryCap;
        return (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.72)",backdropFilter:"blur(2px)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:400}}>
          <div style={{background:C.surface,borderRadius:16,padding:"1.5rem",width:360,maxWidth:"95vw",boxShadow:"0 20px 60px rgba(0,0,0,0.28)",color:C.text}}>
            <div style={{fontWeight:700,fontSize:16,marginBottom:12}}>💰 연봉 조정 — {wageAdjustTarget.name}</div>
            <div style={{padding:"12px",background:C.bg,borderRadius:8,marginBottom:14,fontSize:13}}>
              <div>현재 연봉: <strong>€{wageAdjustTarget.wage}M/주</strong></div>
              <div style={{fontSize:11,color:C.textSm,marginTop:2}}>연봉한도 {fmt(currentTotalWage)}/{fmt(salaryCap)} 사용중</div>
            </div>
            <div style={{marginBottom:12}}>
              <label style={{fontSize:12,color:"#555",marginBottom:6,display:"block"}}>새 연봉 (€M/주)</label>
              <input type="number" min={0.1} max={50} step={0.1} value={wageAdjustAmount} onChange={e=>setWageAdjustAmount(parseFloat(e.target.value)||0)} style={{...INPUT_S}} />
              <div style={{fontSize:11,color:C.textSm,marginTop:4}}>
                {wageAdjustAmount>wageAdjustTarget.wage?`인상: +€${(wageAdjustAmount-wageAdjustTarget.wage).toFixed(1)}M/주`:
                 wageAdjustAmount<wageAdjustTarget.wage?`삭감: -€${(wageAdjustTarget.wage-wageAdjustAmount).toFixed(1)}M/주`:"변경 없음"}
              </div>
            </div>
            {overCap&&(
              <div style={{padding:"8px",background:"#fff5f5",border:"1px solid #fecaca",borderRadius:6,fontSize:12,color:C.danger,marginBottom:10}}>⚠️ 연봉한도 초과! 시즌 종료 시 벌금 €1000M 페널티 적용됩니다</div>
            )}
            <div style={{display:"flex",gap:8}}>
              <button onClick={()=>{
                const diff=wageAdjustAmount-wageAdjustTarget.wage;
                if(wageAdjustAmount<0.1){notify("최소 연봉은 €0.1M입니다","error");return;}
                setSquad(prev=>prev.map(p=>p.id===wageAdjustTarget.id?{...p,wage:wageAdjustAmount}:p));
                const msg=diff>0?`📈 ${wageAdjustTarget.name} 연봉 인상 €${wageAdjustAmount}M/주`:`📉 ${wageAdjustTarget.name} 연봉 삭감 €${wageAdjustAmount}M/주`;
                addNews(msg,"transfer");
                if(diff<-0.5){setFanApproval(prev=>Math.max(0,prev-5));addNews(`😤 팬들: "${wageAdjustTarget.name} 연봉 삭감은 모욕!"`,"fan");}
                notify(diff>0?"연봉 인상 완료!":"연봉 삭감 완료!",diff>0?"success":"info");
                setShowWageAdjust(false);setWageAdjustTarget(null);
              }} style={{...BTN_PRIMARY,flex:1,padding:"9px",fontSize:13}}>✅ 확정</button>
              <button onClick={()=>{setShowWageAdjust(false);setWageAdjustTarget(null);}} style={{...BTN_CANCEL,padding:"9px 16px",fontSize:13}}>취소</button>
            </div>
          </div>
        </div>
        );
      })()}
      {/* ══ 선수 평점 모달 ══ */}
      {showRatingModal&&(
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.72)",backdropFilter:"blur(2px)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:400}}>
          <div style={{background:C.surface,borderRadius:16,padding:"1.5rem",width:500,maxWidth:"95vw",maxHeight:"85vh",overflowY:"auto",boxShadow:"0 20px 60px rgba(0,0,0,0.28)",color:C.text}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
              <div style={{fontWeight:700,fontSize:16}}>⭐ 선수별 시즌 평점</div>
              <button onClick={()=>setShowRatingModal(false)} style={{...BTN_WHITE,padding:"4px 12px",fontSize:13}}>✕</button>
            </div>
            {squad.length===0?<div style={{color:C.textSm}}>스쿼드 없음</div>:(
              <div>
                {[...squad].sort((a,b)=>{
                  const ra=playerRatings[a.id];const rb=playerRatings[b.id];
                  return (rb?.avg||0)-(ra?.avg||0);
                }).map((p,i)=>{
                  const pr=playerRatings[p.id];
                  const cond=playerConditions[p.id];
                  const isInj=injured.includes(p.id);
                  return(
                    <div key={p.id} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 10px",borderRadius:8,marginBottom:4,background:i===0?"#fefce8":i<3?"#f8fafc":"#fff",border:`1px solid ${C.border}`}}>
                      <div style={{width:28,height:28,borderRadius:"50%",background:getPlayerAvatar(p.pos),display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:12,color:"#fff",flexShrink:0}}>{p.rat}</div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontWeight:600,fontSize:13}}>{i===0?"🥇":i===1?"🥈":i===2?"🥉":""} {p.name}</div>
                        <div style={{fontSize:11,color:C.textSm}}>{p.pos} · {p.age}세{isInj?" 🩹":""}</div>
                      </div>
                      <div style={{textAlign:"right"}}>
                        {pr&&pr.count>0?(
                          <div>
                            <div style={{fontWeight:700,fontSize:16,color:pr.avg>=80?"#16a34a":pr.avg>=70?"#d97706":"#dc2626"}}>{pr.avg}</div>
                            <div style={{fontSize:10,color:C.textSm}}>{pr.count}경기</div>
                          </div>
                        ):<span style={{fontSize:11,color:C.textSm}}>출전없음</span>}
                      </div>
                      {cond!==undefined&&<div style={{width:46,textAlign:"center"}}>
                        <div style={{fontSize:10,color:C.textSm}}>컨디션</div>
                        <div style={{fontSize:12,fontWeight:700,color:cond>=80?"#16a34a":cond>=60?"#d97706":"#dc2626"}}>{cond}%</div>
                      </div>}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
      {/* ══ 경기 결과 모달 (텍스트 중계) ══ */}
      {showMatch&&matchRes&&matchPhase==="result"&&(
        <div style={MODAL_OVERLAY}>
          <div style={{...MODAL_BOX,maxWidth:560}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
              <span style={{fontWeight:700,fontSize:16}}>⚽ 경기 결과{matchRes.cupName?` — ${matchRes.cupName}`:""}</span>
              <button onClick={()=>setShowMatch(false)} style={{...BTN_WHITE,padding:"4px 12px",fontSize:13}}>✕</button>
            </div>
            {/* 스코어보드 */}
            <div style={{padding:"16px",background:matchRes.hg>matchRes.ag?"#f0fdf4":matchRes.hg===matchRes.ag?"#f8fafc":"#fff5f5",borderRadius:10,border:`1.5px solid ${matchRes.hg>matchRes.ag?"#bbf7d0":matchRes.hg===matchRes.ag?"#e2e8f0":"#fecaca"}`,marginBottom:14,textAlign:"center"}}>
              <div style={{fontSize:11,color:C.textSm,marginBottom:6}}>⏱ 주{matchRes.week} 경기 결과</div>
              <div style={{display:"flex",justifyContent:"center",alignItems:"center",gap:20}}>
                <div style={{flex:1,textAlign:"center"}}><div style={{fontWeight:700,fontSize:15}}>{matchRes.home?.name}</div><div style={{fontSize:11,color:C.textSm}}>🏠 홈</div></div>
                <div style={{fontSize:46,fontWeight:800,letterSpacing:2}}>{matchRes.hg} - {matchRes.ag}</div>
                <div style={{flex:1,textAlign:"center"}}><div style={{fontWeight:700,fontSize:15}}>{matchRes.away?.name}</div><div style={{fontSize:11,color:C.textSm}}>✈️ 원정</div></div>
              </div>
              {matchRes.penalty&&<div style={{fontSize:11,color:C.textSm,marginTop:4}}>🥅 연장/승부차기 결정</div>}
              <div style={{marginTop:6,fontSize:16,fontWeight:700,color:matchRes.hg>matchRes.ag?"#16a34a":matchRes.hg===matchRes.ag?"#64748b":"#dc2626"}}>
                {matchRes.hg>matchRes.ag?`✅ ${matchRes.penalty?"승부차기 ":""}승리!`:matchRes.hg===matchRes.ag?"➡️ 무승부":"❌ 패배"}
              </div>
            </div>
            {/* 텍스트 중계 로그 */}
            <div style={{fontWeight:700,fontSize:13,marginBottom:8,color:"#333"}}>📺 경기 중계</div>
            <div style={{maxHeight:300,overflowY:"auto",border:`1px solid ${C.border}`,borderRadius:8,background:C.bg}}>
              {matchLog.map((line,i)=>{
                const isGoal=line.includes("⚽");const isInj=line.includes("🩹");const isMvp=line.includes("🏅");const isEnd=line.includes("경기 종료");
                return(
                  <div key={i} style={{padding:"7px 12px",borderBottom:"1px solid #f1f5f9",fontSize:13,color:isGoal?"#16a34a":isInj?"#dc2626":isMvp?"#854d0e":isEnd?"#2563eb":"#333",fontWeight:isGoal||isMvp||isEnd?600:400,background:isGoal?"#f0fdf4":isMvp?"#fefce8":isEnd?"#eff6ff":"transparent"}}>
                    {line}
                  </div>
                );
              })}
            </div>
            {/* MVP */}
            {matchRes.mvp&&(
              <div style={{marginTop:10,padding:"10px 14px",background:"#fefce8",border:"1px solid #fde68a",borderRadius:8,display:"flex",alignItems:"center",gap:10}}>
                <span style={{fontSize:24}}>🏅</span>
                <div>
                  <div style={{fontWeight:700,fontSize:14,color:"#854d0e"}}>오늘의 MVP: {matchRes.mvp.name}</div>
                  <div style={{fontSize:12,color:"#a16207"}}>평점 {matchRes.mvp.rating} / 10 · {matchRes.mvp.goals}골 {matchRes.mvp.assists>0?`· ${matchRes.mvp.assists}도움`:""}</div>
                </div>
              </div>
            )}
            {/* 컨디션 하락 현황 */}
            {(()=>{
              const starters=getStarting();
              if(!starters.length)return null;
              return(
                <div style={{marginTop:10,marginBottom:4}}>
                  <div style={{fontWeight:700,fontSize:12,color:"#555",marginBottom:6}}>🏃 선발 선수 컨디션 변화</div>
                  <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(130px,1fr))",gap:4}}>
                    {starters.map(p=>{
                      const cond=playerConditions[p.id]??100;
                      return(
                        <div key={p.id} style={{display:"flex",alignItems:"center",gap:5,padding:"4px 7px",borderRadius:6,background:C.bg,border:`1px solid ${C.border}`}}>
                          <div style={{width:22,height:22,borderRadius:"50%",background:getPlayerAvatar(p.pos),display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:700,color:"#fff",flexShrink:0}}>{p.rat}</div>
                          <div style={{flex:1,minWidth:0}}>
                            <div style={{fontSize:10,fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.name.length>6?p.name.slice(0,5)+"…":p.name}</div>
                            <div style={{height:3,background:"#e2e8f0",borderRadius:2,marginTop:2}}>
                              <div style={{height:"100%",width:`${cond}%`,background:cond>=70?"#16a34a":cond>=45?"#f59e0b":"#dc2626",borderRadius:2}}/>
                            </div>
                          </div>
                          <span style={{fontSize:10,fontWeight:700,color:cond>=70?"#16a34a":cond>=45?"#d97706":"#dc2626",flexShrink:0}}>{cond}%</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
            {/* 선수별 경기 평점 테이블 */}
            {(()=>{
              const starters=getStarting();
              if(!starters.length||!matchRes.contrib)return null;
              return(
                <div style={{marginTop:10,marginBottom:4}}>
                  <div style={{fontWeight:700,fontSize:12,color:"#333",marginBottom:6}}>📊 선수별 경기 평점</div>
                  <div style={{border:`1px solid ${C.border}`,borderRadius:8,overflow:"hidden"}}>
                    <div style={{display:"grid",gridTemplateColumns:"1fr 40px 36px 36px 36px",background:"#1e293b",color:"#f8fafc",padding:"5px 10px",fontSize:10,fontWeight:700,gap:4}}>
                      <span>선수</span><span style={{textAlign:"center"}}>평점</span><span style={{textAlign:"center"}}>골</span><span style={{textAlign:"center"}}>어시</span><span style={{textAlign:"center"}}>패스%</span>
                    </div>
                    {starters.map((p,i)=>{
                      const c=matchRes.contrib[p.id];
                      if(!c)return null;
                      const rColor=c.rating>=8?"#15803d":c.rating>=7?"#0369a1":c.rating>=6?"#374151":"#dc2626";
                      return(
                        <div key={p.id} style={{display:"grid",gridTemplateColumns:"1fr 40px 36px 36px 36px",gap:4,padding:"5px 10px",fontSize:11,background:i%2===0?"#fff":"#f8fafc",borderBottom:"1px solid #f1f5f9",alignItems:"center"}}>
                          <div style={{display:"flex",alignItems:"center",gap:5}}>
                            <div style={{width:18,height:18,borderRadius:"50%",background:getPlayerAvatar(p.pos),display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,fontWeight:700,color:"#fff",flexShrink:0}}>{p.rat}</div>
                            <span style={{fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.name}</span>
                            <span style={{fontSize:9,color:C.textSm}}>{p.pos}</span>
                          </div>
                          <div style={{textAlign:"center",fontWeight:800,fontSize:14,color:rColor}}>{c.rating.toFixed(1)}</div>
                          <div style={{textAlign:"center",fontWeight:c.goals>0?700:400,color:c.goals>0?"#15803d":"#9ca3af"}}>{c.goals||"-"}</div>
                          <div style={{textAlign:"center",fontWeight:c.assists>0?700:400,color:c.assists>0?"#0369a1":"#9ca3af"}}>{c.assists||"-"}</div>
                          <div style={{textAlign:"center",color:c.passAcc>=80?"#15803d":c.passAcc>=65?"#d97706":"#dc2626",fontWeight:600,fontSize:10}}>{c.passAcc||"-"}%</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
            <button onClick={()=>setShowMatch(false)} style={{...BTN_PRIMARY,width:"100%",marginTop:14,padding:"11px",fontSize:14}}>확인</button>
          </div>
        </div>
      )}

      {/* ══ 하프타임 모달 ══ */}
      {showMatch&&matchLiveState&&matchPhase==="halftime"&&(()=>{
        const MAX_SUBS=3;
        const currentSquad=matchLiveState.starting.map(p=>{
          const sub=pendingSubs.find(s=>s.outId===p.id);
          return sub?squad.find(q=>q.id===sub.inId)||p:p;
        });
        const outIds=pendingSubs.map(s=>s.outId);
        const inIds=pendingSubs.map(s=>s.inId);
        const bench=squad.filter(p=>!matchLiveState.starting.find(s=>s.id===p.id)&&!injured.includes(p.id)&&!inIds.includes(p.id));
        const fh=matchLiveState.firstHalf;
        const fhGoals=fh.events.filter(e=>["goal","yellow","red","injury"].includes(e.type));
        return(
        <div style={MODAL_OVERLAY}>
          <div style={{...MODAL_BOX,maxWidth:600,padding:0,overflow:"hidden"}}>

            {/* ── 헤더: 전반 스코어 ── */}
            <div style={{background:"linear-gradient(135deg,#0f172a,#1e3a5f)",color:"#fff",padding:"18px 20px"}}>
              <div style={{textAlign:"center",fontSize:12,color:"#94a3b8",marginBottom:8,letterSpacing:"0.5px"}}>⏸ 전반 종료</div>
              <div style={{display:"flex",justifyContent:"center",alignItems:"center",gap:24,marginBottom:12}}>
                <div style={{flex:1,textAlign:"right"}}>
                  <div style={{fontWeight:800,fontSize:15}}>{selTeam.name}</div>
                  <div style={{fontSize:11,color:"#94a3b8"}}>🏠 홈</div>
                </div>
                <div style={{fontSize:52,fontWeight:900,letterSpacing:4,color:fh.hg>fh.ag?"#4ade80":fh.hg===fh.ag?"#f8fafc":"#f87171",textShadow:"0 2px 12px rgba(0,0,0,0.4)",minWidth:120,textAlign:"center"}}>
                  {fh.hg} - {fh.ag}
                </div>
                <div style={{flex:1,textAlign:"left"}}>
                  <div style={{fontWeight:800,fontSize:15}}>{matchLiveState.opp.name}</div>
                  <div style={{fontSize:11,color:"#94a3b8"}}>✈️ 원정</div>
                </div>
              </div>
              {/* 전반 이벤트 타임라인 */}
              {fhGoals.length>0&&(
                <div style={{display:"flex",gap:6,flexWrap:"wrap",justifyContent:"center"}}>
                  {fhGoals.map((e,i)=>(
                    <span key={i} style={{fontSize:11,padding:"2px 8px",borderRadius:12,background:"rgba(255,255,255,0.1)",color:e.type==="goal"?"#4ade80":e.type==="injury"?"#f87171":e.type==="red"?"#f87171":"#fbbf24"}}>
                      {e.type==="goal"?(e.home?"⚽":"⚽ 실"):`${e.type==="injury"?"🩹":e.type==="red"?"🟥":"🟨"}`} {e.min}&apos;
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div style={{padding:"16px 20px",maxHeight:"calc(90vh - 200px)",overflowY:"auto"}}>

              {/* ── 교체 섹션 ── */}
              <div style={{marginBottom:16}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
                  <div style={{fontWeight:700,fontSize:14}}>🔄 선수 교체</div>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <span style={{fontSize:12,color:C.textSm}}>교체 {pendingSubs.length}/{MAX_SUBS}</span>
                    <div style={{display:"flex",gap:4}}>
                      {Array.from({length:MAX_SUBS}).map((_,i)=>(
                        <div key={i} style={{width:8,height:8,borderRadius:"50%",background:i<pendingSubs.length?"#16a34a":"#e2e8f0"}}/>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 확정된 교체 목록 */}
                {pendingSubs.length>0&&(
                  <div style={{marginBottom:10,display:"flex",flexDirection:"column",gap:5}}>
                    {pendingSubs.map((sub,i)=>(
                      <div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 12px",background:"#f0fdf4",borderRadius:10,border:"1.5px solid #bbf7d0"}}>
                        <div style={{width:26,height:26,borderRadius:"50%",background:getPlayerAvatar(squad.find(p=>p.id===sub.outId)?.pos||"CM"),display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:700,color:"#fff",flexShrink:0}}>{squad.find(p=>p.id===sub.outId)?.rat||"?"}</div>
                        <span style={{fontSize:12,fontWeight:600,color:"#dc2626",flex:1}}>⬅️ {sub.outName}</span>
                        <span style={{fontSize:18}}>🔄</span>
                        <span style={{fontSize:12,fontWeight:600,color:"#16a34a",flex:1,textAlign:"right"}}>{sub.inName} ➡️</span>
                        <div style={{width:26,height:26,borderRadius:"50%",background:getPlayerAvatar(squad.find(p=>p.id===sub.inId)?.pos||"CM"),display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:700,color:"#fff",flexShrink:0}}>{squad.find(p=>p.id===sub.inId)?.rat||"?"}</div>
                        <button onClick={()=>setPendingSubs(prev=>prev.filter((_,j)=>j!==i))} style={{background:"none",border:"none",cursor:"pointer",fontSize:14,color:"#94a3b8",padding:"2px 4px"}}>✕</button>
                      </div>
                    ))}
                  </div>
                )}

                {/* 교체 선택 인터페이스 */}
                {pendingSubs.length<MAX_SUBS?(
                  <div style={{background:C.bg,borderRadius:12,border:`1px solid ${C.border}`,overflow:"hidden"}}>
                    {/* 스텝 탭 */}
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",background:"#e2e8f0"}}>
                      <button onClick={()=>setSubSelectStep("out")} style={{padding:"8px",border:"none",background:subSelectStep==="out"?"#fff":"transparent",cursor:"pointer",fontFamily:"inherit",fontWeight:subSelectStep==="out"?700:400,fontSize:12,color:subSelectStep==="out"?C.danger:C.textMd,borderBottom:subSelectStep==="out"?`2px solid ${C.danger}`:"2px solid transparent"}}>
                        ⬅️ 아웃 {liveSubstitution?.outId?`(${squad.find(p=>p.id===liveSubstitution.outId)?.name?.slice(0,6)||"선택됨"})`:""} 선택
                      </button>
                      <button onClick={()=>{if(!liveSubstitution?.outId){notify("먼저 교체 아웃 선수를 선택하세요","error");return;}setSubSelectStep("in");}} style={{padding:"8px",border:"none",background:subSelectStep==="in"?"#fff":"transparent",cursor:"pointer",fontFamily:"inherit",fontWeight:subSelectStep==="in"?700:400,fontSize:12,color:subSelectStep==="in"?C.success:C.textMd,borderBottom:subSelectStep==="in"?`2px solid ${C.success}`:"2px solid transparent",opacity:liveSubstitution?.outId?1:0.5}}>
                        ➡️ 인 {liveSubstitution?.inId?`(${squad.find(p=>p.id===liveSubstitution.inId)?.name?.slice(0,6)||"선택됨"})`:""} 선택
                      </button>
                    </div>
                    <div style={{maxHeight:180,overflowY:"auto"}}>
                      {subSelectStep==="out"?(
                        currentSquad.filter(p=>!outIds.includes(p.id)).map(p=>{
                          const isInj=injured.includes(p.id);
                          const pr=playerRatings[p.id];
                          const isSelected=liveSubstitution?.outId===p.id;
                          return(
                            <div key={p.id} onClick={()=>{if(isInj)return;setLiveSubstitution({outId:p.id,inId:null});setSubSelectStep("in");}} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 14px",borderBottom:`1px solid ${C.border}`,cursor:isInj?"not-allowed":"pointer",background:isSelected?"#fff5f5":isInj?"#fafafa":"#fff",opacity:isInj?0.5:1,transition:"background 0.1s"}}>
                              <div style={{width:30,height:30,borderRadius:"50%",background:isSelected?"#dc2626":getPlayerAvatar(p.pos),display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:800,color:"#fff",flexShrink:0}}>{p.rat}</div>
                              <div style={{flex:1}}>
                                <div style={{fontWeight:600,fontSize:12,color:isSelected?C.danger:isInj?"#9ca3af":C.text}}>{p.name}{isInj?" 🩹":""}</div>
                                <div style={{fontSize:10,color:C.textSm}}>{p.pos} · {p.age}세{pr&&pr.count>0?` · 평점 ${pr.avg}`:""}</div>
                              </div>
                              {isSelected&&<span style={{fontSize:14,color:C.danger}}>✓</span>}
                            </div>
                          );
                        })
                      ):(
                        bench.map(p=>{
                          const isSelected=liveSubstitution?.inId===p.id;
                          const outPlayer=squad.find(q=>q.id===liveSubstitution?.outId);
                          const ratingDiff=outPlayer?p.rat-outPlayer.rat:0;
                          return(
                            <div key={p.id} onClick={()=>{
                              setLiveSubstitution(prev=>({...prev,inId:p.id}));
                              // 바로 pendingSubs에 추가
                              const outP=squad.find(q=>q.id===liveSubstitution?.outId)||matchLiveState.starting.find(q=>q.id===liveSubstitution?.outId);
                              if(outP){
                                setPendingSubs(prev=>[...prev,{outId:liveSubstitution.outId,inId:p.id,outName:outP.name,inName:p.name}]);
                                setLiveSubstitution(null);
                                setSubSelectStep("out");
                              }
                            }} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 14px",borderBottom:`1px solid ${C.border}`,cursor:"pointer",background:isSelected?"#f0fdf4":"#fff",transition:"background 0.1s"}}>
                              <div style={{width:30,height:30,borderRadius:"50%",background:getPlayerAvatar(p.pos),display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:800,color:"#fff",flexShrink:0}}>{p.rat}</div>
                              <div style={{flex:1}}>
                                <div style={{fontWeight:600,fontSize:12}}>{p.name}</div>
                                <div style={{fontSize:10,color:C.textSm}}>{p.pos} · {p.age}세</div>
                              </div>
                              <span style={{fontSize:12,fontWeight:700,color:ratingDiff>0?"#16a34a":ratingDiff<0?"#dc2626":"#9ca3af"}}>{ratingDiff>0?"+":""}{ratingDiff}</span>
                            </div>
                          );
                        })
                      )}
                      {subSelectStep==="in"&&bench.length===0&&(
                        <div style={{padding:"20px",textAlign:"center",color:C.textSm,fontSize:12}}>투입 가능한 선수가 없습니다</div>
                      )}
                    </div>
                    {liveSubstitution?.outId&&(
                      <div style={{padding:"6px 14px",background:"#fff",borderTop:`1px solid ${C.border}`,fontSize:11,color:C.textSm}}>
                        아웃: <strong style={{color:C.danger}}>{squad.find(p=>p.id===liveSubstitution.outId)?.name||matchLiveState.starting.find(p=>p.id===liveSubstitution.outId)?.name||"?"}</strong>
                        {liveSubstitution.inId?<> → <strong style={{color:C.success}}>{squad.find(p=>p.id===liveSubstitution.inId)?.name}</strong></>:" → (인 선수 선택 중)"}
                      </div>
                    )}
                  </div>
                ):(
                  <div style={{padding:"12px",background:"#fefce8",border:"1px solid #fde68a",borderRadius:10,fontSize:12,color:"#854d0e",textAlign:"center"}}>
                    최대 교체 횟수({MAX_SUBS}회)를 모두 사용했습니다
                  </div>
                )}
              </div>

              {/* ── 전술 지시 ── */}
              <div style={{marginBottom:16}}>
                <div style={{fontWeight:700,fontSize:14,marginBottom:10}}>📋 후반 전술 지시</div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
                  {[
                    {id:"press",icon:"⚡",label:"고강도 압박",desc:"공격 +15%",color:"#dc2626",bg:"#fff5f5",border:"#fecaca"},
                    {id:"balanced",icon:"⚖️",label:"밸런스",desc:"균형 유지",color:"#2563eb",bg:"#eff6ff",border:"#bfdbfe"},
                    {id:"defensive",icon:"🛡️",label:"수비 집중",desc:"실점 차단",color:"#059669",bg:"#f0fdf4",border:"#bbf7d0"},
                  ].map(opt=>{
                    const sel=halfTimeChoice===opt.id;
                    return(
                      <button key={opt.id} onClick={()=>setHalfTimeChoice(sel?null:opt.id)} style={{padding:"12px 6px",borderRadius:12,border:`2px solid ${sel?opt.color:opt.border}`,background:sel?opt.bg:"#fafafa",cursor:"pointer",fontFamily:"inherit",boxShadow:sel?`0 0 0 3px ${opt.color}22`:"none",transition:"all 0.15s"}}>
                        <div style={{fontSize:24,marginBottom:4}}>{opt.icon}</div>
                        <div style={{fontWeight:700,fontSize:12,color:sel?opt.color:C.text}}>{opt.label}</div>
                        <div style={{fontSize:10,color:sel?opt.color:C.textSm,marginTop:2}}>{opt.desc}</div>
                      </button>
                    );
                  })}
                </div>
                {halfTimeChoice&&(
                  <div style={{marginTop:8,padding:"8px 12px",background:halfTimeChoice==="press"?"#fff5f5":halfTimeChoice==="defensive"?"#f0fdf4":"#eff6ff",borderRadius:8,fontSize:11,color:C.textMd,borderLeft:`3px solid ${halfTimeChoice==="press"?"#dc2626":halfTimeChoice==="defensive"?"#059669":"#2563eb"}`}}>
                    {halfTimeChoice==="press"?"⚡ 공격 전환 속도 상승, 단 역습 노출 위험 증가":halfTimeChoice==="defensive"?"🛡️ 수비 안정성 향상, 득점 기회 감소":"⚖️ 현 전술 유지 — 안정적 운영"}
                  </div>
                )}
              </div>

              {/* ── 후반 시작 버튼 ── */}
              <button onClick={()=>{
                const choice=halfTimeChoice||"balanced";
                confirmHalfTimeAndPlay(choice,null);
              }} style={{...BTN_PRIMARY,width:"100%",padding:"14px",fontSize:15,fontWeight:800,borderRadius:12,letterSpacing:"-0.3px",background:"linear-gradient(135deg,#2563eb,#1d4ed8)",boxShadow:"0 4px 16px rgba(29,78,216,0.35)",marginBottom:8}}>
                ▶ 후반 시작{pendingSubs.length>0?` (교체 ${pendingSubs.length}명 적용)`:""}
                {halfTimeChoice&&halfTimeChoice!=="balanced"?` — ${halfTimeChoice==="press"?"압박":"수비"}전술`:""}
              </button>
              <div style={{fontSize:11,color:C.textSm,textAlign:"center"}}>
                {pendingSubs.length>0?`교체: ${pendingSubs.map(s=>`${s.outName}→${s.inName}`).join(", ")}`:
                 "교체 없이 진행"}
                {halfTimeChoice?` · 전술: ${halfTimeChoice==="press"?"압박강화":halfTimeChoice==="defensive"?"수비집중":"균형유지"}`:" · 전술: 균형유지"}
              </div>
            </div>
          </div>
        </div>
        );
      })()}

      {/* ══ 시즌 종료 모달 ══ */}
      {showSeasonEnd&&seasonSummary&&(
        <div style={MODAL_OVERLAY}>
          <div style={{...MODAL_BOX,maxWidth:560}}>
            <div style={{textAlign:"center",marginBottom:16}}>
              <div style={{fontSize:32,marginBottom:6}}>
                {seasonSummary.myPos===1?"🏆":seasonSummary.myPos<=3?"🥈":"📊"}
              </div>
              <div style={{fontWeight:700,fontSize:20,marginBottom:4}}>시즌 {seasonSummary.season} 종료!</div>
              <div style={{fontSize:14,color:C.textSm}}>최종 순위: <strong style={{color:seasonSummary.myPos<=4?"#2563eb":seasonSummary.myPos>=seasonSummary.sorted.length-2?"#dc2626":"#111"}}>{seasonSummary.myPos}위</strong></div>
            </div>
            {/* 성적 요약 */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:14}}>
              {[["경기",seasonSummary.myRow.p],["승",seasonSummary.myRow.w],["무",seasonSummary.myRow.d],["패",seasonSummary.myRow.l],["득점",seasonSummary.myRow.gf],["실점",seasonSummary.myRow.ga],["득실",seasonSummary.myRow.gf-seasonSummary.myRow.ga],["승점",seasonSummary.myRow.pts]].map(([l,v])=>(
                <div key={l} style={{background:C.bg,border:`1px solid ${C.border}`,borderRadius:8,padding:"10px",textAlign:"center"}}>
                  <div style={{fontSize:18,fontWeight:700}}>{v}</div>
                  <div style={{fontSize:11,color:C.textSm}}>{l}</div>
                </div>
              ))}
            </div>
            {/* 보너스/패널티 */}
            {seasonSummary.bonusMsg&&(
              <div style={{padding:"12px 14px",borderRadius:10,background:seasonSummary.bonusAmt>=0?"#f0fdf4":"#fff5f5",border:`1px solid ${seasonSummary.bonusAmt>=0?"#bbf7d0":"#fecaca"}`,marginBottom:8,fontSize:13,color:seasonSummary.bonusAmt>=0?"#166534":"#dc2626",fontWeight:600}}>
                {seasonSummary.bonusMsg}
              </div>
            )}
            {seasonSummary.lateBonus>0&&(
              <div style={{padding:"12px 14px",borderRadius:10,background:"#fefce8",border:"1px solid #fde68a",marginBottom:8,fontSize:13,color:"#854d0e",fontWeight:600}}>
                {seasonSummary.lateBonusMsg}
              </div>
            )}
            {/* 발롱도르 */}
            {ballonDorHistory.length>0&&(()=>{
              const bd=ballonDorHistory[ballonDorHistory.length-1];
              if(bd.season!==seasonSummary.season)return null;
              return(
                <div style={{marginBottom:14,padding:"14px",background:bd.isMyPlayer?"linear-gradient(135deg,#fefce8,#fef9c3)":"#f8fafc",border:`2px solid ${bd.isMyPlayer?"#f59e0b":"#e2e8f0"}`,borderRadius:12}}>
                  <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
                    <span style={{fontSize:28}}>🏅</span>
                    <div>
                      <div style={{fontWeight:800,fontSize:15,color:bd.isMyPlayer?"#92400e":"#111"}}>
                        {seasonSummary.season}시즌 발롱도르
                        {bd.isMyPlayer&&<span style={{marginLeft:8,background:"#f59e0b",color:"#fff",fontSize:11,padding:"2px 8px",borderRadius:20,fontWeight:700}}>우리 팀!</span>}
                      </div>
                      <div style={{fontSize:13,color:"#555",marginTop:2}}>
                        <strong style={{fontSize:16,color:bd.isMyPlayer?"#b45309":"#111"}}>{bd.winner?.name}</strong>
                        <span style={{marginLeft:6,color:C.textSm,fontSize:12}}>{bd.winner?.pos} · {bd.winner?.rat}OVR</span>
                      </div>
                    </div>
                  </div>
                  {bd.isMyPlayer&&(
                    <div style={{background:"#fffbeb",border:"1px solid #fde68a",borderRadius:8,padding:"8px 12px",fontSize:12,color:"#92400e",marginBottom:8}}>
                      📈 <strong>{bd.winner?.name}</strong> 시장가치 <strong>+120% 급등!</strong><br/>
                      연봉협상 요구 상승 · 명성 +8 · 이적시장 주목도 최고조
                    </div>
                  )}
                  <div style={{fontSize:11,color:C.textSm,marginBottom:4,fontWeight:600}}>🏆 TOP 5</div>
                  <div style={{display:"flex",flexDirection:"column",gap:4}}>
                    {bd.top5.map((p,i)=>(
                      <div key={p.id} style={{display:"flex",alignItems:"center",gap:8,padding:"4px 8px",borderRadius:6,background:i===0?"#fef3c7":p._isGlobal?undefined:"#eff6ff",fontSize:12}}>
                        <span style={{fontWeight:700,color:i===0?"#d97706":"#888",width:16,flexShrink:0}}>{i+1}</span>
                        <div style={{width:24,height:24,borderRadius:"50%",background:getPlayerAvatar(p.pos),display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:"#fff",flexShrink:0}}>{p.rat}</div>
                        <span style={{flex:1,fontWeight:i===0?700:400,color:p._isGlobal?"#555":"#1d4ed8"}}>{p.name}</span>
                        <span style={{color:C.textSm,fontSize:10}}>{p.pos}</span>
                        {!p._isGlobal&&<span style={{fontSize:10,color:"#2563eb",fontWeight:600}}>★ 내팀</span>}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
            {/* 리그 상위 5팀 */}
            <div style={{marginBottom:14}}>
              <div style={{fontWeight:700,fontSize:13,marginBottom:8}}>📊 최종 리그 순위</div>
              {seasonSummary.sorted.slice(0,6).map((row,i)=>(
                <div key={row.id} style={{display:"flex",gap:8,padding:"5px 8px",borderRadius:6,background:row.id===selTeam?.id?"#eff6ff":"transparent",alignItems:"center"}}>
                  <span style={{fontSize:11,color:C.textSm,width:20,fontWeight:700}}>{i+1}</span>
                  <span style={{flex:1,fontSize:13,fontWeight:row.id===selTeam?.id?700:400,color:row.id===selTeam?.id?"#2563eb":"#111"}}>{row.name}{row.id===selTeam?.id?" ★":""}</span>
                  <span style={{fontSize:11,color:C.textSm}}>{row.w}승{row.d}무{row.l}패</span>
                  <span style={{fontSize:13,fontWeight:700,minWidth:30,textAlign:"right"}}>{row.pts}pt</span>
                </div>
              ))}
            </div>
            <button onClick={()=>{
              // 매 시즌 각 포지션마다 17세 신인 2명씩 생성 (총 22명, 한국 선수 제외)
              const newcomers=generateYouthProspects(season+1,22,NAT_POOL_NO_KR);
              newcomers.forEach(p=>ALL_PLAYERS.push(p));
              addNews(`🌟 ${season+1}시즌 17세 신인 ${newcomers.length}명 이적시장 등장! (전 포지션 2명씩)`,"system");
              // 5년에 한 번씩 한국 선수 전용 매물에 엄청난 잠재력의 천재 유망주 등장
              if((season+1)%5===0){
                const wonder=generateKoreanWonderkid(season+1);
                ALL_PLAYERS.push(wonder);
                addNews(`🌟⭐ 5년에 한 번 나오는 천재! 한국 선수 ${wonder.name}(${wonder.pos}, 잠재력 ${wonder.pot}) 이적시장 등장!`,"system");
              }
              // 15시즌마다 명성 높은 왕관(아이콘) 선수 이적시장 등장
              if((season+1)%15===0){
                const iconPos=POS_POOL[Math.floor(Math.random()*POS_POOL.length)];
                const iconNats=["France","Brazil","Argentina","England","Spain","Portugal","Germany","Netherlands"];
                const iconNat=iconNats[Math.floor(Math.random()*iconNats.length)];
                const iconFirst=VFIRST[Math.floor(Math.random()*VFIRST.length)];
                const iconLast=VLAST[Math.floor(Math.random()*VLAST.length)];
                const iconAge=20+Math.floor(Math.random()*5); // 20~24세 전성기 앞둔 나이
                const iconRat=88+Math.floor(Math.random()*7); // 88~94 월드클래스
                const iconPot=Math.max(iconRat,93+Math.floor(Math.random()*5)); // 93~97
                const iconVal=parseFloat((80+Math.random()*120).toFixed(1)); // 80~200M
                const legendPlayer={
                  id:`legend_s${season+1}_${Date.now()%100000}`,
                  name:`${iconFirst} ${iconLast}`,pos:iconPos,age:iconAge,nat:iconNat,club:"",
                  rat:iconRat,pot:iconPot,
                  pace:82+Math.floor(Math.random()*14),sho:80+Math.floor(Math.random()*16),
                  pas:80+Math.floor(Math.random()*16),dri:82+Math.floor(Math.random()*14),
                  def:(iconPos==="GK"||iconPos==="CB"||iconPos==="CDM")?78+Math.floor(Math.random()*16):35+Math.floor(Math.random()*20),
                  phy:78+Math.floor(Math.random()*16),
                  inj:1,val:Math.min(iconVal,400),wage:20, // 👑 아이콘: val 최대 400, 연봉 €20M 고정
                  peak:iconPot,peakY:season+3+Math.floor(Math.random()*5),
                  goals:0,ast:0,fame:92+Math.floor(Math.random()*8), // 명성 92~99
                  bubble:false,leave:false,isVirtual:false,isIcon:true,
                };
                ALL_PLAYERS.push(legendPlayer);
                addNews(`👑✨ [${season+1}시즌 전설 탄생] ${legendPlayer.name}(${legendPlayer.pos}, OVR ${legendPlayer.rat}) 이적시장 등장! 명성 ${legendPlayer.fame}/100`,"trophy");
              }
              // 유스 아카데미: 전체 160개팀 유스 성장 + 내 팀은 신규 유망주 1~2명 충원
              const gradPlayers=[];
              for(let i=ALL_YOUTH_PLAYERS.length-1;i>=0;i--){
                const yp=ALL_YOUTH_PLAYERS[i];
                const growth=getGrowthRate(yp.age,season,yp.pot,yp.rat);
                yp.age=yp.age+1;
                yp.rat=Math.max(45,Math.min(99,Math.round(yp.rat+growth)));
                yp.pot=Math.max(yp.rat,yp.pot);
                if(yp.age>21){
                  if(yp.club===selTeam.id)gradPlayers.push({...yp}); // 내 팀 유스 졸업생 기록
                  ALL_YOUTH_PLAYERS.splice(i,1);
                }
              }
              // 졸업생이 있으면 졸업식 모달 오픈
              if(gradPlayers.length>0){
                setYouthGradQueue(gradPlayers);
                setShowYouthGrad(true);
              }
              const currentYouthCount=ALL_YOUTH_PLAYERS.filter(p=>p.club===selTeam.id).length;
              const youthSlots=Math.max(0,12-currentYouthCount);
              const freshForMe=youthSlots>0?generateAcademyYouth(selTeam.id,Math.min(1+Math.floor(Math.random()*2),youthSlots),season+1):[];
              ALL_YOUTH_PLAYERS.push(...freshForMe);
              if(freshForMe.length>0)addNews(`🌱 유스 아카데미 신입 유망주 ${freshForMe.length}명 합류!`,"system");
              else if(youthSlots===0)addNews(`🏫 유스 아카데미 정원(12명)이 꽉 차 신입 합류 없음`,"system");
              setYouthSquad(ALL_YOUTH_PLAYERS.filter(p=>p.club===selTeam.id).map(p=>({...p})));
              // 다음 시즌 시작 + 선수 에이징 & 성장
              const newSeasonNum=season+1;
              let agedSquad=squad.map(p=>{
                const newAge=p.age+1;
                const decline=getAgingDecline(newAge);
                const growth=getGrowthRate(p.age,season,p.pot,p.rat);
                const delta=growth-decline;
                const newRat=Math.max(55,Math.min(99,Math.round(p.rat+delta)));
                const newPot=Math.max(newRat,p.pot);
                const newVal=parseFloat((p.val*Math.max(0.7,newRat/Math.max(1,p.rat))).toFixed(1));
                const newWage=parseFloat((p.wage*Math.max(0.8,newRat/Math.max(1,p.rat))).toFixed(1));
                return{...p,age:newAge,rat:newRat,pot:newPot,val:newVal,wage:newWage,goals:0,ast:0,
                  careerGoals:(p.careerGoals||0)+(p.goals||0),
                  careerAssists:(p.careerAssists||0)+(p.ast||0),
                  seasonsPlayed:(p.seasonsPlayed||0)+1,
                };
              });
              // ── 맨체스터 유나이티드는 항상 호날두·비르츠 보유 ──
              if(selTeam.id==="man_utd"){
                const ICON_FALLBACKS={
                  p20801:{id:"p20801",name:"크리스티아누 호날두",pos:"ST",age:25,nat:"Portugal",club:"man_utd",rat:100,pot:100,pace:100,sho:100,pas:100,dri:100,def:34,phy:100,inj:2,val:48.3,wage:20,peak:100,peakY:2026,goals:0,ast:0,fame:99,bubble:true,leave:false,isIcon:true},
                  m006:{id:"m006",name:"플로리안 비르츠",pos:"CAM",age:25,nat:"Germany",club:"man_utd",rat:89,pot:96,pace:74,sho:82,pas:88,dri:92,def:54,phy:68,inj:2,val:150.0,wage:12.0,peak:89,peakY:2033,goals:0,ast:0,fame:94,bubble:false,leave:false},
                };
                Object.entries(ICON_FALLBACKS).forEach(([id,fallback])=>{
                  if(agedSquad.find(p=>p.id===id))return; // 이미 보유 중
                  const found=ALL_PLAYERS.find(p=>p.id===id);
                  const restored=found?{...found,club:"man_utd"}:{...fallback};
                  const aidx=ALL_PLAYERS.findIndex(p=>p.id===id);
                  if(aidx!==-1)ALL_PLAYERS[aidx]=restored;else ALL_PLAYERS.push(restored);
                  agedSquad=[...agedSquad,{...restored,contractEndSeason:newSeasonNum+1+Math.floor(Math.random()*4)}];
                  addNews(`🔁 ${restored.name}이(가) 맨체스터 유나이티드 스쿼드에 합류했습니다!`,"transfer");
                });
              }
              // ── 이적시장 선수 에이징 & 성장 (내 스쿼드에 없는 선수만) ──
              for(let i=0;i<ALL_PLAYERS.length;i++){
                const ap=ALL_PLAYERS[i];
                if(agedSquad.find(s=>s.id===ap.id))continue; // 내 스쿼드 선수는 이미 처리됨
                const newAge=ap.age+1;
                const decline=getAgingDecline(newAge);
                const growth=getGrowthRate(ap.age,season,ap.pot,ap.rat);
                const delta=growth-decline;
                const newRat=Math.max(55,Math.min(99,Math.round(ap.rat+delta)));
                const newPot=Math.max(newRat,ap.pot);
                const newVal=parseFloat((ap.val*Math.max(0.7,newRat/Math.max(1,ap.rat))).toFixed(1));
                const newWage=parseFloat((ap.wage*Math.max(0.8,newRat/Math.max(1,ap.rat))).toFixed(1));
                ALL_PLAYERS[i]={...ap,age:newAge,rat:newRat,pot:newPot,val:newVal,wage:newWage};
              }
              // ── 이적시장 정리: 팔리지 않은 42세 이상 선수 제거 (아이콘 선수 제외) ──
              let removedOld=0;
              for(let i=ALL_PLAYERS.length-1;i>=0;i--){
                const ap=ALL_PLAYERS[i];
                // isIcon 예외 없음
                if(ap.age>=42&&!agedSquad.find(s=>s.id===ap.id)){
                  ALL_PLAYERS.splice(i,1);
                  removedOld++;
                }
              }
              if(removedOld>0)addNews(`🧹 이적시장에서 팔리지 않은 42세 이상 선수 ${removedOld}명이 명단에서 제외되었습니다.`,"system");
              setSquad(agedSquadWithContract);
              // 컨디션 초기화 — 전원 100%
              const conds={};
              agedSquadWithContract.forEach(p=>{conds[p.id]=100;});
              setPlayerConditions(conds);
              // ─── 전체 선수 contract -1년 처리 ───
              // ALL_PLAYERS (타 팀) contract 감소 + FA 전환
              for(let i=0;i<ALL_PLAYERS.length;i++){
                const p=ALL_PLAYERS[i];
                if(p.club===selTeam?.id)continue; // 내 팀은 squad에서 처리
                const newContract=Math.max(0,(p.contract||1)-1);
                ALL_PLAYERS[i]={...p,contract:newContract};
                if(newContract===0&&p.club){
                  ALL_PLAYERS[i]={...ALL_PLAYERS[i],club:"",val:parseFloat((p.val*0.7).toFixed(1))};
                }
              }
              // ─── 유망주 임대 방출 성장 처리 ───
              const loanOutGrowthNews=[];
              setLoanOutPlayers(prev=>prev.map(lo=>{
                // 출전 경기 시뮬: 임대팀 프레스티지 vs 선수 OVR
                const toTeamPres=lo.toTeam?.prestige||5;
                const playerRat=lo.player.rat||70;
                // 강팀(pres8+)은 백업 확률 높음, 약팀은 주전 확률 높음
                const startProb=toTeamPres>=9?0.25:toTeamPres>=8?0.45:toTeamPres>=7?0.60:toTeamPres>=6?0.75:0.85;
                const gamesThisSeason=Math.round(38*(startProb+(Math.random()-0.5)*0.15));
                const totalGames=Math.min(38,(lo.gamesPlayed||0)+gamesThisSeason);
                // 성장량: 출전 38경기 = 최대 성장, 0경기 = 0
                const growthRatio=totalGames/38;
                const baseGrowth=lo.player.age<=19?4:lo.player.age<=21?3:lo.player.age<=23?2:1;
                // 강팀 환경 보너스: 높은 프레스티지 = 더 좋은 훈련 환경
                const prestigeEnvBonus=1+(toTeamPres-5)*0.06; // pres5=1.0x, pres9=1.24x
                const ratGrowth=Math.round(growthRatio*baseGrowth*(0.7+Math.random()*0.6)*prestigeEnvBonus);
                const potGrowth=Math.round(growthRatio*(baseGrowth*0.5)*(0.5+Math.random()*1.0)*prestigeEnvBonus);
                const newRat=Math.min(lo.player.pot,lo.player.rat+ratGrowth);
                const newPot=Math.min(99,lo.player.pot+potGrowth);
                const newRemain=(lo.remainSeasons||1)-1;
                // ALL_PLAYERS에도 반영
                const pidx=ALL_PLAYERS.findIndex(p=>p.id===lo.player.id);
                if(pidx!==-1)ALL_PLAYERS[pidx]={...ALL_PLAYERS[pidx],rat:newRat,pot:newPot};
                const grade=totalGames>=30?"주전급":totalGames>=18?"로테이션":"백업";
                loanOutGrowthNews.push({name:lo.player.name,team:lo.toTeam?.name||"",games:totalGames,grade,ratGrowth,potGrowth,newRat,newPot,done:newRemain<=0,player:{...lo.player,rat:newRat,pot:newPot}});
                return{...lo,player:{...lo.player,rat:newRat,pot:newPot},gamesPlayed:totalGames,remainSeasons:newRemain};
              }));
              // 복귀 대상(remainSeasons=0) 뉴스 생성
              loanOutGrowthNews.forEach(g=>{
                addNews(`📈 [임대 리포트] ${g.name} @ ${g.team} — ${g.grade}(${g.games}경기) OVR+${g.ratGrowth} POT+${g.potGrowth} → OVR${g.newRat}/POT${g.newPot}${g.done?" · 임대 종료":""}`, "transfer");
              });
              // ─── 내 팀 선수 contract -1년 + 모럴 → leave 연동 ───
              const agedSquadWithContract=agedSquad.map(p=>{
                const newContract=Math.max(0,(p.contract||1)-1);
                const morale=playerMorale[p.id]||70;
                const leaveFlag=morale<40||p.leave;
                return{...p,contract:newContract,leave:leaveFlag};
              });
              // ─── 계약 만료 선수 체크 → 재계약 모달 ───
              // 계약 0인 선수는 재계약 큐에 추가
              // ─── 임대 방출 종료 선수 복귀 처리 ───
              setLoanOutPlayers(prev=>{
                const returning=prev.filter(lo=>lo.remainSeasons<=0);
                returning.forEach(lo=>{
                  if(agedSquadWithContract.length<30){
                    setSquad(s=>[...s,{...lo.player,club:selTeam.id,isLoanOut:false,contract:lo.player.contract||2,contractEndSeason:newSeasonNum+2}]);
                    addNews(`🔙 ${lo.player.name} 임대 복귀 완료! OVR${lo.player.rat}/POT${lo.player.pot}`,"transfer");
                    notify(`${lo.player.name} 임대 복귀!`,"success");
                  }
                });
                return prev.filter(lo=>lo.remainSeasons>0);
              });
              const actualExpiring=agedSquadWithContract.filter(p=>p.contract===0||(p.contractEndSeason||0)<=newSeasonNum);
              if(actualExpiring.length>0){
                setRenewalQueue(actualExpiring);
                setShowContractRenewal(true);
              }
              // ─── 연봉 요청 / 삭감 대상 선수 계산 ───
              const trophyCount=wonTrophies.length;
              const demands=[];
              agedSquad.forEach(p=>{
                if(expiring.find(e=>e.id===p.id))return; // 계약만료 선수는 재계약 모달에서 처리
                const pr=playerRatings[p.id];
                const avgRating=pr&&pr.count>0?pr.avg:null; // pr.avg는 ×10 스케일 (70=7.0점)
                // 👑 아이콘 선수: 연봉 인상 요구 없음 (연봉 20 고정)
                if(p.isIcon){
                  return; // 연봉 협상 대상에서 제외
                }
                if(!avgRating)return;
                // 5.5점 이상 → 연봉 인상 요청
                if(avgRating>=55){
                  // 요청 인상률: 평점 구간별 차등
                  const raisePct=avgRating>=90?0.30:avgRating>=80?0.20:avgRating>=75?0.12:avgRating>=70?0.07:0.03;
                  const demandWage=parseFloat((p.wage*(1+raisePct)).toFixed(1));
                  // 트로피 보너스: 우승 대회 수에 따라 추가 요구 (랜덤으로 일부 선수만)
                  const wantBonus=trophyCount>=3&&Math.random()<0.5||trophyCount>=5&&Math.random()<0.8;
                  const bonusAmt=wantBonus?parseFloat((p.wage*(trophyCount>=5?0.15:0.08)).toFixed(1)):0;
                  demands.push({
                    player:p,
                    type:"raise",
                    demandWage:parseFloat((demandWage+bonusAmt).toFixed(1)),
                    baseRaise:raisePct,
                    bonusTrophy:bonusAmt>0,
                    bonusAmt,
                    trophyCount,
                    avgRating:parseFloat(avgRating.toFixed(1)),
                    reason:avgRating>=90?"압도적 퍼포먼스":avgRating>=80?"훌륭한 활약":avgRating>=75?"좋은 시즌":avgRating>=70?"안정적 활약":"최소 기준 충족",
                  });
                }
                // 5점 미만 → 연봉 삭감 가능
                else if(avgRating<50&&p.wage>0.5){
                  const cutPct=avgRating<30?0.25:0.12;
                  const cutWage=Math.max(0.3,parseFloat((p.wage*(1-cutPct)).toFixed(1)));
                  demands.push({
                    player:p,
                    type:"cut",
                    demandWage:p.wage, // 현재 유지 또는 삭감 선택
                    cutWage,
                    cutPct,
                    avgRating:parseFloat(avgRating.toFixed(1)),
                    reason:avgRating<30?"심각한 부진":"저조한 퍼포먼스",
                  });
                }
              });
              if(demands.length>0){
                setWageDemandQueue(demands);
                setShowWageDemand(true);
              }
              setShowSeasonEnd(false);
              setSeasonFinished(false);
              setSeason(s=>s+1);
              setWeek(1);
              setFakeUsed(false);
              setHijackedPlayers(new Set());
              const t=LEAGUES[selLeague].teams.map(t=>({id:t.id,name:t.name,p:0,w:0,d:0,l:0,gf:0,ga:0,pts:0}));
              setTable(t);
              const cups={};Object.keys(CUPS).forEach(cid=>{cups[cid]={round:1,active:true};});
              setCupProgress(cups);
              setInjured([]);setInjuryMatches({});
              addNews(`🆕 새 시즌 시작! 선수 나이 +1세, 에이징커브 적용됨`,"system");
              notify("새 시즌 시작! 선수들이 1년 더 나이를 먹었습니다.","success");
            }} style={{...BTN_SUCCESS,width:"100%",padding:"13px",fontSize:15}}>🆕 다음 시즌 시작 (에이징 적용)</button>
          </div>
        </div>
      )}
      {/* ══ 재정 위기 — 선수 계약해지 모달 ══ */}
      {showReleaseModal&&(()=>{
        const totalW=squad.reduce((s,p)=>s+p.wage,0);
        const cap=getSalaryCap(selTeam)+permWageBonus;
        const overBy=parseFloat((totalW-cap).toFixed(1));
        // 해지 보상금: 잔여 계약 기간 × 주급 × 26주 (반 시즌 보상)
        const calcReleaseFee=(p)=>{
          const remaining=Math.max(0,(p.contractEndSeason||season)-season);
          return parseFloat((p.wage*26*remaining*0.5).toFixed(1));
        };
        return(
        <div style={{...MODAL_OVERLAY,zIndex:500}}>
          <div style={{...MODAL_BOX,maxWidth:580}}>
            <div style={{background:"linear-gradient(135deg,#fef2f2,#fff5f5)",border:"2px solid #fca5a5",borderRadius:12,padding:"16px",marginBottom:16,textAlign:"center"}}>
              <div style={{fontSize:28,marginBottom:6}}>🚨</div>
              <div style={{fontWeight:800,fontSize:18,color:"#dc2626",marginBottom:4}}>재정 위기!</div>
              <div style={{fontSize:13,color:"#7f1d1d"}}>예산이 <strong style={{color:"#dc2626"}}>€{budget.toFixed(1)}M</strong>으로 마이너스입니다.</div>
              {totalW>cap&&<div style={{fontSize:12,color:"#991b1b",marginTop:4}}>연봉 총액 <strong>€{totalW.toFixed(1)}M</strong>이 상한선 <strong>€{cap}M</strong>을 <strong>€{overBy}M</strong> 초과 중</div>}
              <div style={{fontSize:12,color:"#7f1d1d",marginTop:6}}>선수를 계약해지하여 재정을 정상화하세요. 해지 시 보상금이 지출됩니다.</div>
            </div>
            <div style={{fontWeight:700,fontSize:14,marginBottom:8,color:"#374151"}}>보유 선수 목록 ({squad.length}명)</div>
            <div style={{maxHeight:360,overflowY:"auto",display:"flex",flexDirection:"column",gap:6,marginBottom:14}}>
              {[...squad].sort((a,b)=>b.wage-a.wage).map(p=>{
                const fee=calcReleaseFee(p);
                const contractLeft=Math.max(0,(p.contractEndSeason||season)-season);
                return(
                <div key={p.id} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",background:C.bg,borderRadius:10,border:`1px solid ${C.border}`}}>
                  <div style={{width:38,height:38,borderRadius:"50%",background:getPlayerAvatar(p.pos),display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:14,color:"#fff",flexShrink:0}}>{p.rat}</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontWeight:700,fontSize:13,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.name}{p.isIcon&&<span style={{marginLeft:4,fontSize:10,background:"#fef3c7",color:"#92400e",padding:"1px 5px",borderRadius:8}}>👑아이콘</span>}</div>
                    <div style={{fontSize:11,color:C.textSm}}>{p.pos} · {p.age}세 · OVR {p.rat}</div>
                  </div>
                  <div style={{textAlign:"right",flexShrink:0}}>
                    <div style={{fontSize:12,fontWeight:700,color:"#dc2626"}}>€{p.wage}M/주</div>
                    <div style={{fontSize:10,color:C.textSm}}>계약 {contractLeft}년 남음</div>
                    <div style={{fontSize:10,color:"#b45309"}}>보상금 €{fee}M</div>
                  </div>
                  <button onClick={()=>{
                    if(p.isIcon&&squad.filter(s=>!s.isIcon).length<8){notify("아이콘 선수 해지 불가 — 일반 선수를 먼저 방출하세요","error");return;}
                    // 보상금 지출
                    setBudget(prev=>parseFloat((prev-fee).toFixed(1)));
                    // 선수 방출
                    setSquad(prev=>prev.filter(s=>s.id!==p.id));
                    // 이적시장으로 복귀
                    const idx=ALL_PLAYERS.findIndex(ap=>ap.id===p.id);
                    if(idx!==-1)ALL_PLAYERS[idx]={...ALL_PLAYERS[idx],club:""};
                    else ALL_PLAYERS.push({...p,club:""});
                    addNews(`✂️ 재정 위기로 ${p.name} 계약해지 (보상금 €${fee}M 지불)`,"transfer");
                    notify(`${p.name} 계약해지 완료. 보상금 -€${fee}M`,"error");
                    // 재정 회복 확인
                    setBudget(cur=>{
                      if(cur>=0){setShowReleaseModal(false);notify("✅ 재정 정상화!","success");}
                      return cur;
                    });
                  }} style={{...BTN_DANGER,padding:"7px 12px",fontSize:12,flexShrink:0}}>해지</button>
                </div>
              );})}
            </div>
            <div style={{display:"flex",gap:8,alignItems:"center",padding:"10px 12px",background:"#fef2f2",borderRadius:8,marginBottom:10,fontSize:12,color:"#991b1b"}}>
              <span>💰</span>
              <span>현재 예산: <strong style={{fontSize:14}}>€{budget.toFixed(1)}M</strong> · 연봉 총합: <strong>€{totalW.toFixed(1)}M</strong> / 상한 €{cap}M</span>
            </div>
            {budget>=0&&(
              <button onClick={()=>setShowReleaseModal(false)} style={{...BTN_SUCCESS,width:"100%",padding:"11px",fontSize:14}}>✅ 재정 정상화 완료 — 닫기</button>
            )}
            {budget<0&&(
              <div style={{textAlign:"center",fontSize:12,color:"#dc2626",fontWeight:600}}>⚠️ 예산이 아직 마이너스입니다. 선수를 더 방출해야 합니다.</div>
            )}
          </div>
        </div>
      );})()}
      {/* ══ 계약 만료 재계약 모달 ══ */}
      {showContractRenewal&&renewalQueue.length>0&&(
        <div style={MODAL_OVERLAY}>
          <div style={{...MODAL_BOX,maxWidth:560}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
              <div>
                <div style={{fontWeight:700,fontSize:17}}>📜 계약 만료 — 재계약 협상</div>
                <div style={{fontSize:12,color:C.textSm,marginTop:2}}>아래 {renewalQueue.length}명의 계약이 만료되었습니다. 재계약(최대 {MAX_CONTRACT_YEARS}년) 또는 방출을 선택하세요.</div>
                <div style={{fontSize:11,color:"#2563eb",marginTop:4}}>📐 계약 상한선 = 계약금액(현 주급×{CONTRACT_CAP_BASE_YEARS}년) ÷ 계약년도 — 장기계약일수록 연간 주급 상한이 낮아집니다.</div>
              </div>
            </div>
            <div style={{maxHeight:440,overflowY:"auto",display:"flex",flexDirection:"column",gap:8}}>
              {renewalQueue.map(p=>(
                <div key={p.id} style={{padding:"10px 12px",background:C.bg,border:`1px solid ${C.border}`,borderRadius:9}}>
                  <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
                    <div style={{width:34,height:34,borderRadius:"50%",background:getPlayerAvatar(p.pos),display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:13,color:"#fff",flexShrink:0}}>{p.rat}</div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontWeight:600,fontSize:13}}>{p.isIcon?"👑 ":""}{p.name} <span style={{fontSize:10,color:C.textSm}}>{p.pos} · {p.age}세</span></div>
                      <div style={{fontSize:11,color:C.textSm}}>현재 주급 €{p.wage}M · OVR {p.rat}</div>
                    </div>
                  </div>
                  <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                    {CONTRACT_YEAR_OPTIONS.map(y=>{
                      const rawWage=parseFloat((p.wage*(1+0.05*y)).toFixed(1));
                      const newWage=p.isIcon ? 20 : Math.min(rawWage,getMaxWageForYears(p.wage,y));
                      return(
                        <button key={y} onClick={()=>{
                          setSquad(prev=>prev.map(s=>s.id===p.id?{...s,contractEndSeason:(season+1)+y,wage:newWage}:s));
                          setRenewalQueue(prev=>{
                            const next=prev.filter(r=>r.id!==p.id);
                            if(next.length===0)setShowContractRenewal(false);
                            return next;
                          });
                          addNews(`📝 ${p.name} 재계약 체결 (${y}년, 주급 €${newWage}M)`,"transfer");
                          setSquad(prev=>prev.map(s=>s.id===p.id?{...s,contract:y,contractEndSeason:season+1+y}:s));
                        }} style={{padding:"6px 10px",borderRadius:6,border:"1px solid #bfdbfe",background:"#eff6ff",color:"#2563eb",cursor:"pointer",fontFamily:"inherit",fontSize:11,fontWeight:600}}>재계약 {y}년 (€{newWage}M/주)</button>
                      );
                    })}
                    <button onClick={()=>{
                      setSquad(prev=>prev.filter(s=>s.id!==p.id));
                      const idx=ALL_PLAYERS.findIndex(ap=>ap.id===p.id);
                      if(idx!==-1)ALL_PLAYERS[idx]={...ALL_PLAYERS[idx],club:""};
                      setRenewalQueue(prev=>{
                        const next=prev.filter(r=>r.id!==p.id);
                        if(next.length===0)setShowContractRenewal(false);
                        return next;
                      });
                      addNews(`🔓 ${p.name} 방출 — 자유계약 신분으로 전환`,"transfer");
                      notify(`${p.name} 방출됨 (자유계약)`,"info");
                    }} style={{padding:"6px 10px",borderRadius:6,border:"1px solid #fecaca",background:"#fff5f5",color:C.danger,cursor:"pointer",fontFamily:"inherit",fontSize:11,fontWeight:600}}>🔓 방출 (자유계약)</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {/* ══ 2D 경기 뷰어 ══ */}
      {show2DMatch&&match2DData&&(()=>{
        const {homeSq,awaySq,homeTeam,awayTeam,events,formation:fm,half,firstHalf}=match2DData;
        const initHg=half===2?(firstHalf?.hg||0):0;
        const initAg=half===2?(firstHalf?.ag||0):0;
        return <Match2DViewer
          homeSq={homeSq} awaySq={awaySq}
          homeTeam={homeTeam} awayTeam={awayTeam}
          events={events} formation={fm} half={half}
          initHg={initHg} initAg={initAg}
          speed={match2DSpeed} paused={match2DPaused}
          onSpeedChange={setMatch2DSpeed}
          onPauseToggle={()=>setMatch2DPaused(p=>!p)}
          onHalfEnd={()=>{
            // 전반 종료 → 하프타임 모달로
            setShow2DMatch(false);
            setShowMatch(true);
            setMatchPhase("halftime");
          }}
          onSecondHalfEnd={(secondHalfEvents)=>{
            // 후반 종료 → 미리 계산된 결과 사용
            setShow2DMatch(false);
            const res=match2DData.secondHalfRes;
            const logs=buildMatchLog(res,homeTeam,awayTeam);
            applyMatchResult(res,awayTeam,logs);
          }}
          getPlayerAvatar={getPlayerAvatar}
          FORMATIONS={FORMATIONS}
        />;
      })()}

      {/* ══ 연봉 요청 모달 ══ */}
      {showWageDemand&&wageDemandQueue.length>0&&(()=>{
        const current=wageDemandQueue[0];
        const p=current.player;
        const isRaise=current.type==="raise";
        const isCut=current.type==="cut";
        const remaining=wageDemandQueue.length;
        const salaryCap=getSalaryCap(selTeam)+permWageBonus;
        const currentTotal=squad.reduce((s,q)=>s+q.wage,0);
        const afterTotal=isRaise?parseFloat((currentTotal-p.wage+current.demandWage).toFixed(1)):currentTotal;
        const overCapIfAccept=isRaise&&afterTotal>salaryCap;
        const ratingColor=current.avgRating>=80?"#15803d":current.avgRating>=70?"#0369a1":current.avgRating>=50?"#d97706":"#dc2626";

        const acceptDemand=()=>{
          const newWage=isRaise?current.demandWage:p.wage; // 인상 수용 or 삭감 거부
          setSquad(prev=>prev.map(s=>s.id===p.id?{...s,wage:newWage}:s));
          if(isRaise){
            addNews(`💰 ${p.name} 연봉 인상 요청 수용: €${p.wage}M → €${newWage}M/주${current.bonusTrophy?" (트로피 보너스 포함)":""}`,current.bonusTrophy?"trophy":"transfer");
            setFanApproval(prev=>Math.min(100,prev+2));
          }else{
            addNews(`🤝 ${p.name} 연봉 유지 합의 (삭감 없음)`,"transfer");
          }
          setWageDemandQueue(prev=>{const next=prev.slice(1);if(next.length===0)setShowWageDemand(false);return next;});
        };
        const rejectDemand=()=>{
          if(isRaise){
            // 인상 거부 → 선수 불만, 이적 희망 가능성
            // 👑 아이콘 선수는 거절 시 10~20% 확률로 이적 희망 (일반 선수보다 낮음 — 자존심은 있으나 클럽 애정도 있음)
            const leaveChance=current.isIconDemand?(0.10+Math.random()*0.10):current.avgRating>=80?0.55:0.3;
            const goesLeave=Math.random()<leaveChance;
            if(goesLeave){
              setSquad(prev=>prev.map(s=>s.id===p.id?{...s,leave:true}:s));
              if(current.isIconDemand){
                addNews(`👑😤 ${p.name}(아이콘), 연봉 협상 결렬 — 이적 희망 선언 (낮은 확률이었지만...)`,"drama");
                setFanApproval(prev=>Math.max(0,prev-8));
              }else{
                addNews(`😤 ${p.name}, 연봉 협상 결렬로 이적 희망 선언!`,"drama");
                setFanApproval(prev=>Math.max(0,prev-4));
              }
            }else{
              if(current.isIconDemand){
                addNews(`👑 ${p.name}(아이콘) 연봉 요청 거절 — 불만 표출하나 잔류 의사 유지`,"drama");
                setFanApproval(prev=>Math.max(0,prev-3));
              }else{
                addNews(`😞 ${p.name} 연봉 인상 요청 거절 — 불만 표출`,"drama");
                setFanApproval(prev=>Math.max(0,prev-2));
              }
            }
          }else{
            // 삭감 수용
            setSquad(prev=>prev.map(s=>s.id===p.id?{...s,wage:current.cutWage}:s));
            addNews(`📉 ${p.name} 부진으로 연봉 삭감: €${p.wage}M → €${current.cutWage}M/주`,"transfer");
          }
          setWageDemandQueue(prev=>{const next=prev.slice(1);if(next.length===0)setShowWageDemand(false);return next;});
        };

        return(
        <div style={MODAL_OVERLAY}>
          <div style={{...MODAL_BOX,maxWidth:480,padding:0,overflow:"hidden"}}>
            {/* 헤더 */}
            <div style={{background:isRaise?"linear-gradient(135deg,#1e3a5f,#0f172a)":"linear-gradient(135deg,#450a0a,#1c0606)",color:"#fff",padding:"16px 20px"}}>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
                <span style={{fontSize:20}}>{isRaise?"💰":"📉"}</span>
                <span style={{fontWeight:800,fontSize:15}}>{isRaise?"연봉 인상 요청":"연봉 삭감 검토"}</span>
                <span style={{marginLeft:"auto",fontSize:11,color:"#94a3b8",background:"rgba(255,255,255,0.1)",padding:"2px 8px",borderRadius:10}}>{remaining}건 남음</span>
              </div>
              <div style={{fontSize:11,color:"#94a3b8"}}>{isRaise?"좋은 시즌을 보낸 선수가 연봉 인상을 요구합니다":"저조한 시즌을 보낸 선수의 연봉 삭감을 검토하세요"}</div>
            </div>

            <div style={{padding:"18px 20px"}}>
              {/* 선수 카드 */}
              <div style={{display:"flex",alignItems:"center",gap:12,padding:"12px 14px",background:C.bg,borderRadius:12,border:`1px solid ${C.border}`,marginBottom:14}}>
                <div style={{width:44,height:44,borderRadius:"50%",background:getPlayerAvatar(p.pos),display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:16,color:"#fff",flexShrink:0}}>{p.rat}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontWeight:700,fontSize:14,color:C.text}}>{p.isIcon?"👑 ":""}{p.name}</div>
                  <div style={{fontSize:11,color:C.textSm}}>{p.pos} · {p.age}세 · OVR {p.rat}</div>
                </div>
                <div style={{textAlign:"right"}}>
                  <div style={{fontWeight:800,fontSize:22,color:ratingColor}}>{current.avgRating}</div>
                  <div style={{fontSize:10,color:C.textSm}}>시즌 평점</div>
                </div>
              </div>

              {/* 요청 내용 */}
              <div style={{marginBottom:14}}>
                <div style={{fontSize:12,color:C.textSm,fontWeight:600,marginBottom:8}}>
                  {isRaise?`"${current.reason} — 연봉 인상을 요청합니다"`:`"${current.reason} — 연봉 재조정이 필요합니다"`}
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                  <div style={{background:"#f8fafc",borderRadius:10,padding:"10px 12px",border:`1px solid ${C.border}`}}>
                    <div style={{fontSize:10,color:C.textSm,marginBottom:3}}>현재 주급</div>
                    <div style={{fontWeight:700,fontSize:16,color:C.text}}>€{p.wage}M</div>
                  </div>
                  {isRaise?(
                    <div style={{background:"#fff7ed",borderRadius:10,padding:"10px 12px",border:"1px solid #fed7aa"}}>
                      <div style={{fontSize:10,color:"#c2410c",marginBottom:3}}>요구 주급</div>
                      <div style={{fontWeight:800,fontSize:16,color:"#c2410c"}}>€{current.demandWage}M</div>
                      <div style={{fontSize:9,color:"#d97706",marginTop:2}}>+{Math.round(current.baseRaisePct*100||((current.demandWage-p.wage)/p.wage*100))}% 인상</div>
                    </div>
                  ):(
                    <div style={{background:"#fef2f2",borderRadius:10,padding:"10px 12px",border:"1px solid #fecaca"}}>
                      <div style={{fontSize:10,color:C.danger,marginBottom:3}}>삭감 제안 주급</div>
                      <div style={{fontWeight:800,fontSize:16,color:C.danger}}>€{current.cutWage}M</div>
                      <div style={{fontSize:9,color:C.danger,marginTop:2}}>-{Math.round(current.cutPct*100)}% 삭감</div>
                    </div>
                  )}
                </div>

                {/* 트로피 보너스 배지 */}
                {isRaise&&current.bonusTrophy&&(
                  <div style={{marginTop:8,padding:"8px 12px",background:"#fefce8",border:"1px solid #fde68a",borderRadius:8,fontSize:12,color:"#92400e",display:"flex",alignItems:"center",gap:6}}>
                    <span>🏆</span>
                    <span>트로피 보너스 포함 — 이번 시즌 {current.trophyCount}개 우승에 따른 추가 요구 <strong>(+€{current.bonusAmt}M/주)</strong></span>
                  </div>
                )}

                {/* 연봉 상한선 초과 경고 */}
                {isRaise&&overCapIfAccept&&(
                  <div style={{marginTop:8,padding:"8px 12px",background:"#fff5f5",border:"1px solid #fecaca",borderRadius:8,fontSize:12,color:C.danger,display:"flex",alignItems:"center",gap:6}}>
                    <span>⚠️</span>
                    <span>수용 시 연봉 총합 €{afterTotal}M → 상한선 €{salaryCap}M 초과! 시즌 종료 시 벌금 €1000M</span>
                  </div>
                )}

                {/* 👑 아이콘 선수 강력 경고 배지 */}
                {isRaise&&current.isIconDemand&&(
                  <div style={{marginTop:8,padding:"10px 14px",background:"linear-gradient(135deg,#fefce8,#fef3c7)",border:"2px solid #f59e0b",borderRadius:10,fontSize:12,color:"#92400e",display:"flex",alignItems:"center",gap:8}}>
                    <span style={{fontSize:18}}>👑</span>
                    <div>
                      <div style={{fontWeight:800,marginBottom:2}}>👑 아이콘 선수 연봉 요구</div>
                      <div style={{fontSize:11,color:"#b45309"}}>활약(7점↑) +10% · 부진해도 +5% · 트로피 보너스 강제 포함<br/>거절 시 이적 희망 확률 <strong>10~20%</strong> (낮음)</div>
                    </div>
                  </div>
                )}

                {/* 거절 시 리스크 안내 */}
                {isRaise&&(
                  <div style={{marginTop:8,padding:"8px 12px",background:"#f0f9ff",border:"1px solid #bae6fd",borderRadius:8,fontSize:11,color:"#0369a1"}}>
                    ⚠️ 거절 시: 선수가 이적 희망을 선언할 수 있습니다 {current.isIconDemand?"(👑 아이콘 선수 — 확률 낮음 10~20%)":current.avgRating>=80?"(확률 높음 55%)":"(확률 보통 30%)"}
                  </div>
                )}
                {isCut&&(
                  <div style={{marginTop:8,padding:"8px 12px",background:"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:8,fontSize:11,color:"#166534"}}>
                    ✅ 삭감 수용 시 연봉상한 절약 — 거절 시 현 주급 유지
                  </div>
                )}
              </div>

              {/* 버튼 */}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <button onClick={rejectDemand} style={{padding:"12px",borderRadius:10,border:`1.5px solid ${isCut?C.border:"#fecaca"}`,background:isCut?"#f0fdf4":"#fff5f5",color:isCut?C.success:C.danger,cursor:"pointer",fontFamily:"inherit",fontWeight:700,fontSize:13}}>
                  {isRaise?"❌ 거절":"✅ 삭감 수용"}
                </button>
                <button onClick={acceptDemand} disabled={isRaise&&overCapIfAccept} style={{padding:"12px",borderRadius:10,background:isRaise&&overCapIfAccept?"#e5e7eb":isRaise?"linear-gradient(135deg,#059669,#047857)":"#fff5f5",color:isCut?C.danger:isRaise&&overCapIfAccept?"#9ca3af":"#fff",cursor:isRaise&&overCapIfAccept?"not-allowed":"pointer",fontFamily:"inherit",fontWeight:700,fontSize:13,border:isCut?"1.5px solid #fecaca":"none"}}>
                  {isRaise?"✅ 수용":"🚫 거절 (유지)"}
                </button>
              </div>
            </div>
          </div>
        </div>
        );
      })()}

      {/* ══ 영입 협상 모달 ══ */}
      {showNeg&&tTarget&&(
        <div style={MODAL_OVERLAY}>
          <div style={{...MODAL_BOX,maxWidth:460}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
              <span style={{fontWeight:700,fontSize:17}}>🤝 영입 협상</span>
              <button onClick={()=>{setShowNeg(false);setTTarget(null);}} style={{...BTN_WHITE,padding:"4px 12px",fontSize:13}}>✕</button>
            </div>
            <div style={{padding:"12px",background:"#f0fdf4",border:"1.5px solid #bbf7d0",borderRadius:10,marginBottom:14,display:"flex",gap:14,alignItems:"center"}}>
              <div style={{width:48,height:48,borderRadius:"50%",background:"#16a34a",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:20,color:"#fff",flexShrink:0}}>{tTarget.rat}</div>
              <div>
                <div style={{fontWeight:700,fontSize:16}}>{tTarget.name}</div>
                <div style={{fontSize:12,color:"#555"}}>{tTarget.pos} · {tTarget.age}세 · {tTarget.nat}</div>
                <div style={{fontSize:12,color:"#555"}}>잠재력 <strong style={{color:C.success}}>{tTarget.pot||tTarget.rat}</strong></div>
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:12}}>
              {[["시장 가치",fmt(getMarketVal(tTarget))],["주급",`€${tTarget.wage}M`],["명성",`${tTarget.fame}/100`],["전성기",`${tTarget.peak}(${tTarget.peakY})`],["부상 빈도",`${tTarget.inj}/10`],["이번 시즌",`${tTarget.goals}G/${tTarget.ast}A`]].map(([k,v])=>(
                <div key={k} style={CARD}><div style={{fontSize:10,color:C.textSm,marginBottom:2}}>{k}</div><div style={{fontWeight:700,fontSize:13}}>{v}</div></div>
              ))}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(6,1fr)",gap:4,marginBottom:12}}>
              {[["속도",tTarget.pace],["슈팅",tTarget.sho],["패스",tTarget.pas],["드리블",tTarget.dri],["수비",tTarget.def],["피지컬",tTarget.phy]].map(([k,v])=>(
                <div key={k} style={{textAlign:"center",background:v>=85?"#ecfdf5":v>=70?"#eff6ff":"#f8fafc",border:`1px solid ${v>=85?"#6ee7b7":v>=70?"#bfdbfe":"#e5e7eb"}`,padding:"6px 4px",borderRadius:8}}>
                  <div style={{fontSize:15,fontWeight:700,color:v>=85?"#059669":v>=70?"#2563eb":"#6b7280"}}>{v}</div>
                  <div style={{fontSize:9,color:C.textSm}}>{k}</div>
                </div>
              ))}
            </div>
            {tTarget.bubble&&<div style={{padding:"9px 12px",background:"#fff7ed",border:"1px solid #fed7aa",borderRadius:8,fontSize:12,color:"#c2410c",marginBottom:8}}>⚠️ 거품 선수: 이적료 대비 퍼포먼스가 낮을 수 있습니다</div>}
            {!tTarget.leave&&<div style={{padding:"9px 12px",background:"#fefce8",border:"1px solid #fde68a",borderRadius:8,fontSize:12,color:"#92400e",marginBottom:8}}>🔒 소속팀 이적 선호도 낮음 — 시장가의 115% 이상 제안 필요</div>}
            {tTarget.club===""&&<div style={{padding:"9px 12px",background:"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:8,fontSize:12,color:"#166534",marginBottom:8}}>🆓 자유계약 선수 — 이적료 대폭 할인 적용됨</div>}
            {tTarget.isIcon&&<div style={{padding:"9px 12px",background:"#fef9c3",border:"1px solid #fde68a",borderRadius:8,fontSize:12,color:"#854d0e",marginBottom:8,fontWeight:600}}>👑 아이콘 선수 — 연봉 €20M/주 고정 · 계약금액 최대 €6,000M</div>}
            <div style={{background:C.bg,border:`1px solid ${C.border}`,borderRadius:10,padding:"14px",marginBottom:14}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                <span style={{fontSize:13,fontWeight:600}}>제안 금액</span>
                <span style={{fontSize:18,fontWeight:700,color:tOffer>getMarketVal(tTarget)*1.6?"#dc2626":tOffer<getMarketVal(tTarget)*0.7?"#d97706":"#2563eb"}}>{fmt(tOffer)}</span>
              </div>
              <div style={{display:"flex",gap:6,marginBottom:8,alignItems:"center"}}>
                <span style={{fontSize:12,color:C.textSm}}>€</span>
                <input type="number" value={tOfferInput} onChange={e=>{setTOfferInput(e.target.value);const v=parseFloat(e.target.value);if(!isNaN(v))setTOffer(v);}} placeholder="금액 입력(M)" style={{flex:1,padding:"6px 8px",border:"1px solid #d1d5db",borderRadius:6,fontSize:14,fontWeight:700}}/>
                <span style={{fontSize:12,color:C.textSm}}>M</span>
                <button onClick={()=>{const v=Math.round(getMarketVal(tTarget));setTOffer(v);setTOfferInput(String(v));}} style={{...BTN_WHITE,padding:"5px 10px",fontSize:11}}>시장가</button>
              </div>
              <input type="range" min={Math.round(getMarketVal(tTarget)*0.3)} max={Math.round(getMarketVal(tTarget)*4)} step={Math.round(getMarketVal(tTarget)*0.05)||1} value={tOffer} onChange={e=>{const v=Number(e.target.value);setTOffer(v);setTOfferInput(String(v));}} style={{width:"100%",accentColor:"#2563eb"}} />
              <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:C.textSm,marginTop:6}}>
                <span>{fmt(getMarketVal(tTarget)*0.3)} (최저)</span>
                <span style={{color:"#2563eb",fontWeight:600}}>적정가 {fmt(getMarketVal(tTarget))}</span>
                <span>{fmt(getMarketVal(tTarget)*4)} (최고)</span>
              </div>
              {tOffer>getMarketVal(tTarget)*1.6&&<div style={{marginTop:6,fontSize:11,color:C.danger,fontWeight:500}}>⚠️ 과도한 제안</div>}
              {tOffer<getMarketVal(tTarget)*0.7&&<div style={{marginTop:6,fontSize:11,color:C.warn,fontWeight:500}}>⚠️ 거절 가능성 높음</div>}
            </div>
            {/* ══ 계약 기간 — 선수 선호도 + 금액 설득 시스템 ══ */}
            {(()=>{
              const p=tTarget;
              const age=p.age||25;
              const fame=p.fame||70;
              // ── 선수가 원하는 계약 기간 계산 ──
              // 나이 기반 기본 선호: 나이 많을수록 단기, 젊을수록 안정적 장기
              const agePreferMin = age>=35?1:age>=32?1:age>=29?2:age>=26?2:3;
              const agePreferMax = age>=35?2:age>=32?3:age>=29?4:age>=26?5:5;
              // 명성 보정: 슈퍼스타(fame95+)는 단기 고액 선호, 무명(fame<70)은 장기 안정 선호
              const fameMod = fame>=95?-1:fame>=85?0:fame>=70?0:1;
              const playerWantMin = Math.max(1,agePreferMin+fameMod);
              const playerWantMax = Math.min(5,agePreferMax+fameMod);
              // ── 이적료 기반 계약기간 설득 가능성 ──
              // 이적료가 시장가의 N배 이상이면 선수가 계약기간을 양보
              const marketVal = getMarketVal(p);
              const offerRatio = tOffer / Math.max(1, marketVal);
              // 1.0배 미만: 설득력 없음 / 1.2배: 소폭 양보 / 1.5배+: 대폭 양보 / 2.0배+: 거의 무조건 수용
              const moneyOverrideStrength =
                offerRatio>=2.0?"완전수용":
                offerRatio>=1.5?"대폭양보":
                offerRatio>=1.2?"소폭양보":
                offerRatio>=1.0?"약간설득":"없음";
              // 실제 수용 가능 최대 기간 (금액이 클수록 늘어남)
              const moneyBonusYears =
                offerRatio>=2.0?99:  // 사실상 모든 기간 수용
                offerRatio>=1.5?3:
                offerRatio>=1.2?2:
                offerRatio>=1.0?1:0;
              const effectiveAcceptMax = Math.min(MAX_CONTRACT_YEARS, playerWantMax+moneyBonusYears);
              // 현재 선택한 계약기간의 상태 판단
              const inPreferZone  = contractYears>=playerWantMin && contractYears<=playerWantMax;
              const inTolerance   = !inPreferZone && contractYears<=effectiveAcceptMax;
              const outOfRange    = contractYears>effectiveAcceptMax;
              // 거절 확률 계산
              const baseRejectProb = outOfRange
                ? Math.min(0.90, 0.40+(contractYears-effectiveAcceptMax)*0.12)
                : inTolerance ? 0.10 : 0.0;
              // 금액이 2배 이상이면 거절 확률 0으로 감소
              const finalRejectProb = offerRatio>=2.0 ? 0 : baseRejectProb;
              // 선호 범위 게이지 표시용 색상
              const getYearStyle=(y)=>{
                const isSelected=contractYears===y;
                const inWant=y>=playerWantMin&&y<=playerWantMax;
                const inTol=!inWant&&y<=effectiveAcceptMax;
                const outRange=y>effectiveAcceptMax;
                return{
                  flex:"1 0 14%",minWidth:44,padding:"9px 0",borderRadius:8,cursor:"pointer",
                  fontFamily:"inherit",fontSize:12,fontWeight:isSelected?800:500,
                  border:isSelected?"2.5px solid #2563eb":inWant?"1.5px solid #16a34a":inTol?"1.5px solid #f59e0b":"1.5px solid #fca5a5",
                  background:isSelected?"#2563eb":inWant?"#f0fdf4":inTol?"#fefce8":outRange?"#fff5f5":"#fff",
                  color:isSelected?"#fff":inWant?"#16a34a":inTol?"#d97706":outRange?"#dc2626":"#555",
                };
              };
              return(
                <div style={{background:C.bg,border:`1px solid ${C.border}`,borderRadius:10,padding:"12px 14px",marginBottom:14}}>
                  <div style={{fontWeight:700,fontSize:13,marginBottom:10}}>📝 계약 기간 협상</div>
                  {/* 선수 선호 인디케이터 */}
                  <div style={{marginBottom:10,padding:"10px 12px",borderRadius:8,background:C.surface,border:`1px solid ${C.border}`}}>
                    <div style={{fontSize:11,fontWeight:700,color:"#555",marginBottom:6}}>🎯 선수 희망 계약 기간</div>
                    <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
                      <div style={{display:"flex",alignItems:"center",gap:4}}>
                        <span style={{fontSize:20}}>{age>=35?"🧓":age>=30?"👨":"🧑"}</span>
                        <div>
                          <div style={{fontSize:13,fontWeight:800,color:C.text}}>
                            {playerWantMin===playerWantMax?`${playerWantMin}년`:`${playerWantMin}~${playerWantMax}년`}
                            <span style={{marginLeft:6,fontSize:10,fontWeight:500,color:C.textSm}}>
                              {age>=35?"(고령 — 단기 선호)":age>=32?"(베테랑 — 단기 안정)":age>=29?"(전성기 — 중기 선호)":age>=26?"(성숙기 — 중장기)":"(젊음 — 안정적 장기)"}
                            </span>
                          </div>
                          <div style={{fontSize:10,color:C.textSm,marginTop:1}}>
                            명성 {fame} · {fame>=95?"슈퍼스타(단기 고액 우선)":fame>=85?"스타급(시장가 중시)":fame>=70?"주전급":"조연급(장기 안정 선호)"}
                          </div>
                        </div>
                      </div>
                      {/* 현재 이적료 설득력 배지 */}
                      <div style={{marginLeft:"auto",padding:"4px 10px",borderRadius:20,fontSize:11,fontWeight:700,
                        background:offerRatio>=2.0?"#7c3aed":offerRatio>=1.5?"#2563eb":offerRatio>=1.2?"#16a34a":offerRatio>=1.0?"#d97706":"#f1f5f9",
                        color:offerRatio>=1.0?"#fff":"#888",border:"none"}}>
                        {offerRatio>=2.0?"💎 압도적 금액":offerRatio>=1.5?"💰 금액으로 설득 가능":offerRatio>=1.2?"📈 약간의 설득력":offerRatio>=1.0?"💬 설득 여지 있음":"💸 설득력 부족"}
                      </div>
                    </div>
                    {/* 금액 설득 효과 안내 */}
                    {moneyBonusYears>0&&(
                      <div style={{marginTop:6,padding:"5px 8px",background:offerRatio>=2.0?"#f5f3ff":"#eff6ff",borderRadius:6,fontSize:10,color:offerRatio>=2.0?"#7c3aed":"#2563eb",fontWeight:500}}>
                        {offerRatio>=2.0
                          ?"💎 시장가 2배+ 제안 — 선수가 어떤 계약기간도 수락합니다"
                          :`💰 높은 이적료 덕분에 최대 +${moneyBonusYears}년 추가 수용 (최대 ${effectiveAcceptMax}년까지)`}
                      </div>
                    )}
                  </div>
                  {/* 연도 선택 버튼 */}
                  <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:8}}>
                    {CONTRACT_YEAR_OPTIONS.map(y=>(
                      <button key={y} onClick={()=>setContractYears(y)} style={getYearStyle(y)}>
                        {y}년
                        {y>=playerWantMin&&y<=playerWantMax&&<div style={{fontSize:8,marginTop:1,opacity:0.8}}>선호</div>}
                        {y>playerWantMax&&y<=effectiveAcceptMax&&<div style={{fontSize:8,marginTop:1,opacity:0.8}}>설득가능</div>}
                        {y>effectiveAcceptMax&&<div style={{fontSize:8,marginTop:1,opacity:0.8}}>기피</div>}
                      </button>
                    ))}
                  </div>
                  {/* 범례 */}
                  <div style={{display:"flex",gap:10,fontSize:10,color:C.textSm,marginBottom:10,flexWrap:"wrap"}}>
                    <span style={{display:"flex",alignItems:"center",gap:3}}><span style={{width:10,height:10,borderRadius:3,background:"#f0fdf4",border:"1.5px solid #16a34a",display:"inline-block"}}/>선수 선호</span>
                    <span style={{display:"flex",alignItems:"center",gap:3}}><span style={{width:10,height:10,borderRadius:3,background:"#fefce8",border:"1.5px solid #f59e0b",display:"inline-block"}}/>금액으로 설득가능</span>
                    <span style={{display:"flex",alignItems:"center",gap:3}}><span style={{width:10,height:10,borderRadius:3,background:"#fff5f5",border:"1.5px solid #fca5a5",display:"inline-block"}}/>기피(거절위험)</span>
                  </div>
                  {/* 현재 선택 상태 요약 */}
                  <div style={{padding:"9px 12px",borderRadius:8,marginBottom:8,fontSize:12,fontWeight:500,
                    background:outOfRange?"#fff5f5":inTolerance?"#fefce8":"#f0fdf4",
                    border:`1px solid ${outOfRange?"#fecaca":inTolerance?"#fde68a":"#bbf7d0"}`,
                    color:outOfRange?"#dc2626":inTolerance?"#92400e":"#166534"}}>
                    {outOfRange
                      ?`🚫 ${contractYears}년은 선수가 강하게 기피 — 거절 확률 ${Math.round(finalRejectProb*100)}%${offerRatio>=2.0?" (하지만 압도적 금액으로 수락!)":`${finalRejectProb>0?"":" (금액이 충분히 크면 무시됨)"}`}`
                      :inTolerance
                      ?`⚠️ ${contractYears}년은 선호 범위 초과지만 금액에 설득됨 — 거절 확률 ${Math.round(finalRejectProb*100)}%`
                      :`✅ ${contractYears}년은 선수가 원하는 기간 — 협상 원활`}
                  </div>
                  {/* 주급 & 만료 정보 */}
                  <div style={{fontSize:11,color:C.textSm}}>
                    <span>계약 만료: 시즌 {season+contractYears} 종료 시</span>
                    <span style={{marginLeft:12,color:"#2563eb"}}>
                      주급 {getCappedWage(tTarget.wage,contractYears)<tTarget.wage
                        ?`€${getCappedWage(tTarget.wage,contractYears)}M (장기계약 상한 적용)`
                        :`€${tTarget.wage}M`}
                    </span>
                  </div>
                </div>
              );
            })()}
            <div style={{display:"flex",gap:10}}>
              <button onClick={()=>doTransfer(tTarget,tOffer)} style={{...BTN_PRIMARY,flex:1,padding:"11px",fontSize:14}}>📨 제안 전송</button>
              {tOffer>budget*0.7&&budget<getMarketVal(tTarget)&&(
                <button onClick={()=>{
                  const seasons=3;const perSeason=parseFloat((tOffer/seasons).toFixed(1));
                  if(budget<perSeason){notify(`첫 납부금 ${fmt(perSeason)} 부족`,"error");return;}
                  setBudget(prev=>parseFloat((prev-perSeason).toFixed(1)));
                  const cappedWage2=tTarget.isIcon?20:getCappedWage(tTarget.wage,contractYears);
                  const currentWageTotal2=squad.reduce((s,p)=>s+p.wage,0);const salaryCap2=getSalaryCap(selTeam)+permWageBonus;
                  if(currentWageTotal2+cappedWage2>salaryCap2)notify(`⚠️ 연봉상한선 초과!`,"error");
                  setInstallmentDeals(prev=>[...prev,{player:tTarget.name,totalFee:tOffer,paid:perSeason,remaining:tOffer-perSeason,perSeason}]);
                  finalizeTransfer(tTarget,tOffer,cappedWage2,contractYears);
                  addNews(`💳 ${tTarget.name} 분할납부 영입! 총 ${fmt(tOffer)} / ${seasons}시즌 분할 (€${perSeason}M/시즌)`,"transfer");
                }} style={{...BTN_WHITE,padding:"11px 10px",fontSize:11,whiteSpace:"nowrap"}}>💳 분할<br/>{fmt(Math.round(tOffer/3))}×3</button>
              )}
              <button onClick={()=>{setShowNeg(false);setTTarget(null);}} style={{...BTN_CANCEL,padding:"11px 18px",fontSize:13}}>취소</button>
            </div>
          </div>
        </div>
      )}
      {/* ══ 은퇴식 모달 ══ */}
      {showRetire&&retireTarget&&retireCareerInfo&&(()=>{
        const p=retireTarget;
        const{tier,approvalChange,careerGoals,careerAssists,seasonsPlayed}=retireCareerInfo;
        const chosenTier=retireTierChoice||tier;
        const isLegend=chosenTier==="레전드",isVeteranStar=chosenTier==="베테랑";
        const tierLabel=isLegend?"🏆 레전드 은퇴식":isVeteranStar?"👏 헌정 은퇴식":"👋 은퇴 신고";
        return(
        <div style={MODAL_OVERLAY}>
          <div style={{...MODAL_BOX,maxWidth:420}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
              <span style={{fontWeight:700,fontSize:17}}>{tierLabel}</span>
              <button onClick={()=>{setShowRetire(false);setRetireTarget(null);setRetireTribute("");setRetireCareerInfo(null);}} style={{...BTN_WHITE,padding:"4px 12px",fontSize:13}}>✕</button>
            </div>
            <div style={{padding:"14px",background:isLegend?"linear-gradient(135deg,#fefce8,#fef9c3)":isVeteranStar?"#eff6ff":"#f8fafc",border:`1.5px solid ${isLegend?"#f59e0b":isVeteranStar?"#bfdbfe":"#e2e8f0"}`,borderRadius:10,marginBottom:14,display:"flex",gap:14,alignItems:"center"}}>
              <div style={{width:52,height:52,borderRadius:"50%",background:getPlayerAvatar(p.pos),display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:20,color:"#fff",flexShrink:0}}>{p.rat}</div>
              <div>
                <div style={{fontWeight:700,fontSize:16}}>{p.isIcon?"👑 ":""}{p.name}</div>
                <div style={{fontSize:12,color:"#555"}}>{p.pos} · {p.age}세 · {p.nat}</div>
                <div style={{fontSize:12,color:"#555"}}>명성 {p.fame}/100 · 통산 {seasonsPlayed}시즌 {careerGoals}골 {careerAssists}도움</div>
              </div>
            </div>
            <div style={{padding:"12px 14px",background:C.surface,border:`1px solid ${C.border}`,borderRadius:10,marginBottom:14,fontSize:13,lineHeight:1.6,color:"#374151"}}>
              {retireTribute}
            </div>
            {approvalChange>0&&<div style={{padding:"9px 12px",background:"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:8,fontSize:12,color:"#166534",marginBottom:14,fontWeight:600}}>📈 팬 지지도 +{approvalChange}% 상승</div>}
            <div style={{marginBottom:12}}>
              <div style={{fontSize:12,fontWeight:700,color:C.textMd,marginBottom:8}}>은퇴식 종류 선택</div>
              <div style={{display:"flex",gap:6}}>
                {["레전드","베테랑","일반"].map(t=>(
                  <button key={t} onClick={()=>setRetireTierChoice(t)} style={{flex:1,padding:"8px 4px",borderRadius:8,border:`1.5px solid ${(retireTierChoice||tier)===t?"#f59e0b":"#e2e8f0"}`,background:(retireTierChoice||tier)===t?"#fefce8":"#fff",cursor:"pointer",fontFamily:"inherit",fontSize:12,fontWeight:700,color:(retireTierChoice||tier)===t?"#92400e":"#6b7280"}}>
                    {t==="레전드"?"🏆 레전드":t==="베테랑"?"👏 베테랑":"👋 일반"}
                  </button>
                ))}
              </div>
              <div style={{fontSize:10,color:C.textSm,marginTop:4}}>※ 레전드 은퇴식은 명예의 전당 입성 + 팬 지지도 상승</div>
            </div>
            <div style={{display:"flex",gap:10}}>
              <button onClick={()=>{const c=retireTierChoice||tier;const ap=c==="레전드"?retireCareerInfo.approvalChange:c==="베테랑"?Math.floor(retireCareerInfo.approvalChange*0.5):0;retirePlayer({...p,_retireTier:c,_retireApproval:ap});}} style={{...BTN_DANGER,flex:1,padding:"11px",fontSize:14}}>{isLegend?"🏆 은퇴식 진행":isVeteranStar?"👏 헌정 행사 진행":"🏁 은퇴 확정"}</button>
              <button onClick={()=>{setShowRetire(false);setRetireTarget(null);setRetireTribute("");setRetireCareerInfo(null);setRetireTierChoice(null);}} style={{...BTN_CANCEL,padding:"11px 18px",fontSize:13}}>취소</button>
            </div>
            <div style={{marginTop:8,fontSize:11,color:C.danger,textAlign:"center"}}>⚠️ 이 작업은 되돌릴 수 없습니다.</div>
          </div>
        </div>
        );
      })()}
      {/* ══ 유스 졸업식 모달 ══ */}
      {showYouthGrad&&youthGradQueue.length>0&&(
        <div style={MODAL_OVERLAY}>
          <div style={{...MODAL_BOX,maxWidth:440}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
              <span style={{fontWeight:700,fontSize:17}}>🎓 유스 아카데미 졸업식</span>
              <button onClick={()=>setShowYouthGrad(false)} style={{...BTN_WHITE,padding:"4px 12px",fontSize:13}}>✕</button>
            </div>
            <div style={{fontSize:13,color:C.textSm,marginBottom:12}}>이번 시즌 유스를 졸업하는 선수 {youthGradQueue.length}명입니다. 1군 미승격 선수는 자유계약으로 이적시장에 나옵니다.</div>
            {youthGradQueue.map(p=>{
              const alreadyInSquad=squad.find(s=>s.id===p.id);
              return(
                <div key={p.id} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 12px",background:C.bg,borderRadius:10,marginBottom:8,border:`1px solid ${C.border}`}}>
                  <div style={{width:40,height:40,borderRadius:"50%",background:getPlayerAvatar(p.pos),display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:15,color:"#fff",flexShrink:0}}>{p.rat}</div>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:700,fontSize:13}}>{p.name}</div>
                    <div style={{fontSize:11,color:C.textSm}}>{p.pos} · {p.age}세 · OVR {p.rat} · 잠재력 {p.pot}</div>
                  </div>
                  {alreadyInSquad?(
                    <span style={{fontSize:11,color:C.success,fontWeight:600}}>✓ 1군</span>
                  ):(
                    <button onClick={()=>{
                      if(squad.length>=30){notify("1군 스쿼드가 가득 찼습니다 (30명)","error");return;}
                      const demandW=parseFloat((p.val*0.12+0.3).toFixed(1));
                      setYouthNegTarget(p);setYouthNegWage(demandW);
                      setShowYouthGrad(false);setShowYouthNeg(true);
                    }} style={{padding:"5px 10px",fontSize:11,borderRadius:6,border:"1px solid #bfdbfe",background:"#eff6ff",cursor:"pointer",color:"#2563eb",fontWeight:600,flexShrink:0}}>⬆️ 1군 승격</button>
                  )}
                </div>
              );
            })}
            <div style={{marginTop:4,fontSize:11,color:C.textSm,textAlign:"center"}}>졸업생 중 미승격 선수는 자동으로 이적시장(자유계약)에 등록됩니다.</div>
            <button onClick={()=>{
              // 미승격 졸업생 → 이적시장 자유계약 등록
              youthGradQueue.forEach(p=>{
                if(!squad.find(s=>s.id===p.id)){
                  const freeAgent={...p,club:"",isYouth:undefined};
                  ALL_PLAYERS.push(freeAgent);
                  addNews(`🎓 ${p.name}(${p.pos}, ${p.age}세, OVR ${p.rat}) 유스 졸업 → 자유계약 이적시장 등록`,"system");
                }
              });
              setYouthGradQueue([]);setShowYouthGrad(false);
            }} style={{...BTN_PRIMARY,width:"100%",padding:"11px",fontSize:13,marginTop:8}}>✅ 졸업식 완료</button>
          </div>
        </div>
      )}
      {/* ══ 유스 1군 승격 연봉협상 모달 ══ */}
      {showYouthNeg&&youthNegTarget&&(()=>{
        const p=youthNegTarget;
        const demandWage=youthNegWage;
        const salaryCap=getSalaryCap(selTeam)+permWageBonus;
        const currentTotal=squad.reduce((s,q)=>s+q.wage,0);
        const canSign=currentTotal+demandWage<=salaryCap;
        return(
        <div style={MODAL_OVERLAY}>
          <div style={{...MODAL_BOX,maxWidth:400}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
              <span style={{fontWeight:700,fontSize:17}}>💰 1군 승격 연봉 협상</span>
              <button onClick={()=>{setShowYouthNeg(false);setYouthNegTarget(null);}} style={{...BTN_WHITE,padding:"4px 12px",fontSize:13}}>✕</button>
            </div>
            <div style={{display:"flex",gap:12,alignItems:"center",padding:"12px",background:C.bg,borderRadius:10,marginBottom:14,border:`1px solid ${C.border}`}}>
              <div style={{width:46,height:46,borderRadius:"50%",background:getPlayerAvatar(p.pos),display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:18,color:"#fff",flexShrink:0}}>{p.rat}</div>
              <div>
                <div style={{fontWeight:700,fontSize:15}}>{p.name}</div>
                <div style={{fontSize:12,color:C.textSm}}>{p.pos} · {p.age}세 · OVR {p.rat} · 잠재력 {p.pot}</div>
              </div>
            </div>
            <div style={{padding:"12px",background:"#fefce8",border:"1px solid #fde68a",borderRadius:10,marginBottom:14}}>
              <div style={{fontSize:13,fontWeight:700,color:"#854d0e",marginBottom:4}}>선수 요구 연봉</div>
              <div style={{fontSize:22,fontWeight:800,color:"#92400e"}}>€{demandWage}M<span style={{fontSize:13,fontWeight:400}}>/주</span></div>
              <div style={{fontSize:11,color:"#a16207",marginTop:4}}>현재 연봉 총액: €{currentTotal.toFixed(1)}M / 한도 €{salaryCap}M</div>
            </div>
            {!canSign&&<div style={{padding:"9px 12px",background:"#fff5f5",border:"1px solid #fecaca",borderRadius:8,fontSize:12,color:C.danger,marginBottom:12,fontWeight:600}}>⚠️ 연봉 한도 초과! 시즌 종료 시 벌금 €1000M 적용</div>}
            <div style={{display:"flex",gap:10}}>
              <button onClick={()=>{
                const contractYrs=2+Math.floor(Math.random()*2); // 2~3년 계약
                setSquad(prev=>[...prev,{...p,wage:demandWage,club:selTeam.id,isVirtual:true,isYouth:undefined,promoted:true,contractEndSeason:season+contractYrs}]);
                setYouthSquad(prev=>prev.filter(y=>y.id!==p.id));
                {const gi=ALL_YOUTH_PLAYERS.findIndex(y=>y.id===p.id);if(gi!==-1)ALL_YOUTH_PLAYERS.splice(gi,1);}
                setPlayerConditions(prev=>({...prev,[p.id]:100}));
                addNews(`⬆️ ${p.name} 1군 승격! (${p.pos}, OVR ${p.rat}) 연봉 €${demandWage}M/주 · ${contractYrs}년 계약`,"transfer");
                notify(`${p.name} 1군 승격 & 계약 완료!`,"success");
                setShowYouthNeg(false);setYouthNegTarget(null);
              }} style={{...BTN_PRIMARY,flex:1,padding:"11px",fontSize:13}}>✅ 계약 체결{!canSign&&" (상한초과)"}</button>
              <button onClick={()=>{
                // 거절 시 선수가 자유계약으로 이적시장 등록
                const freeAgent={...p,club:"",isYouth:undefined};
                ALL_PLAYERS.push(freeAgent);
                setYouthSquad(prev=>prev.filter(y=>y.id!==p.id));
                {const gi=ALL_YOUTH_PLAYERS.findIndex(y=>y.id===p.id);if(gi!==-1)ALL_YOUTH_PLAYERS.splice(gi,1);}
                addNews(`❌ ${p.name} 연봉 협상 결렬 → 자유계약 이적시장 등록`,"transfer");
                notify(`${p.name} 협상 결렬, 이적시장 등록`,"info");
                setShowYouthNeg(false);setYouthNegTarget(null);
              }} style={{...BTN_CANCEL,padding:"11px 16px",fontSize:13}}>거절</button>
            </div>
          </div>
        </div>
        );
      })()}
      {/* ══ 은퇴 선수 명예의 전당 모달 ══ */}
      {showHallOfFame&&(
        <div style={MODAL_OVERLAY}>
          <div style={{...MODAL_BOX,maxWidth:560}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
              <div>
                <div style={{fontWeight:700,fontSize:17}}>🏛️ 은퇴 선수 명예의 전당</div>
                <div style={{fontSize:12,color:C.textSm,marginTop:2}}>레전드 은퇴식을 거친 선수 {retiredLegends.length}명 · 레전드 은퇴식 선택 시에만 입성됩니다</div>
              </div>
              <button onClick={()=>setShowHallOfFame(false)} style={{...BTN_WHITE,padding:"5px 14px",fontSize:13}}>✕</button>
            </div>
            {retiredLegends.length===0?(
              <div style={{color:C.textSm,fontSize:13,textAlign:"center",padding:"2rem 0"}}>아직 레전드 은퇴식을 진행한 선수가 없습니다.<br/>35세 이상 선수 은퇴 시 🏆 레전드 은퇴식을 선택하면 입성됩니다.</div>
            ):(
              <div style={{maxHeight:480,overflowY:"auto",display:"flex",flexDirection:"column",gap:6}}>
                {retiredLegends.map((l,i)=>{
                  const tierIcon=l.tier==="레전드"?"👑":l.tier==="베테랑"?"👏":"👋";
                  const tierColor=l.tier==="레전드"?"#d97706":l.tier==="베테랑"?"#2563eb":"#64748b";
                  const tierBg=l.tier==="레전드"?"#fefce8":l.tier==="베테랑"?"#eff6ff":"#f8fafc";
                  const tierBorder=l.tier==="레전드"?"#fde68a":l.tier==="베테랑"?"#bfdbfe":"#e2e8f0";
                  return(
                    <div key={`${l.id}_${i}`} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",background:tierBg,border:`1px solid ${tierBorder}`,borderRadius:9}}>
                      <div style={{width:34,height:34,borderRadius:"50%",background:getPlayerAvatar(l.pos),display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:13,color:"#fff",flexShrink:0}}>{l.rat}</div>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontWeight:700,fontSize:13}}>{tierIcon} {l.name} <span style={{fontSize:10,color:C.textSm,fontWeight:400}}>{l.pos} · {l.nat} · {l.age}세 은퇴</span></div>
                        <div style={{fontSize:11,color:C.textSm}}>통산 {l.seasons}시즌 · {l.goals}골 {l.ast}도움</div>
                      </div>
                      <div style={{textAlign:"right",flexShrink:0}}>
                        <span style={{fontSize:10,fontWeight:700,color:tierColor,background:C.surface,padding:"2px 7px",borderRadius:10,border:`1px solid ${tierColor}44`}}>{l.tier}</span>
                        <div style={{fontSize:10,color:C.textSm,marginTop:3}}>S{l.season} 은퇴</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            <button onClick={()=>setShowHallOfFame(false)} style={{...BTN_PRIMARY,width:"100%",padding:"11px",fontSize:14,marginTop:14}}>닫기</button>
          </div>
        </div>
      )}
      {/* ══ 매각 모달 ══ */}
      {showSell&&sellTarget&&(
        <div style={MODAL_OVERLAY}>
          <div style={{...MODAL_BOX,maxWidth:420}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
              <span style={{fontWeight:700,fontSize:17}}>📤 선수 매각</span>
              <button onClick={()=>{setShowSell(false);setSellTarget(null);}} style={{...BTN_WHITE,padding:"4px 12px",fontSize:13}}>✕</button>
            </div>
            <div style={{padding:"12px",background:"#fff5f5",border:"1.5px solid #fecaca",borderRadius:10,marginBottom:14,display:"flex",gap:14,alignItems:"center"}}>
              <div style={{width:48,height:48,borderRadius:"50%",background:"#dc2626",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:20,color:"#fff",flexShrink:0}}>{sellTarget.rat}</div>
              <div>
                <div style={{fontWeight:700,fontSize:16}}>{sellTarget.name}</div>
                <div style={{fontSize:12,color:"#555"}}>{sellTarget.pos} · {sellTarget.age}세 · {sellTarget.nat}</div>
                <div style={{fontSize:12,color:"#555"}}>시장가 <strong style={{color:C.danger}}>{fmt(getMarketVal(sellTarget))}</strong></div>
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:14}}>
              {[["시장가",fmt(getMarketVal(sellTarget))],["적정 매각가",fmt(getMarketVal(sellTarget)*0.85)],["최대 기대가",fmt(getMarketVal(sellTarget)*1.2)]].map(([k,v])=>(
                <div key={k} style={CARD}><div style={{fontSize:10,color:C.textSm,marginBottom:3}}>{k}</div><div style={{fontWeight:700,fontSize:13}}>{v}</div></div>
              ))}
            </div>
            <div style={{background:C.bg,border:`1px solid ${C.border}`,borderRadius:10,padding:"14px",marginBottom:14}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                <span style={{fontSize:13,fontWeight:600}}>매각 희망 금액</span>
                <span style={{fontSize:18,fontWeight:700,color:sellOffer>=getMarketVal(sellTarget)?"#16a34a":sellOffer>=getMarketVal(sellTarget)*0.7?"#2563eb":"#dc2626"}}>{fmt(sellOffer)}</span>
              </div>
              <input type="range" min={Math.round(getMarketVal(sellTarget)*0.3)} max={Math.round(getMarketVal(sellTarget)*2)} step={Math.round(getMarketVal(sellTarget)*0.05)||1} value={sellOffer} onChange={e=>setSellOffer(Number(e.target.value))} style={{width:"100%",accentColor:"#dc2626"}} />
              <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:C.textSm,marginTop:6}}>
                <span>{fmt(getMarketVal(sellTarget)*0.3)}</span>
                <span style={{color:C.danger,fontWeight:600}}>시장가 {fmt(getMarketVal(sellTarget))}</span>
                <span>{fmt(getMarketVal(sellTarget)*2)}</span>
              </div>
              {sellOffer>getMarketVal(sellTarget)*1.3&&<div style={{marginTop:6,fontSize:11,color:C.warn,fontWeight:500}}>⚠️ 높은 가격 — 협상 타결 어려울 수 있음</div>}
            </div>
            {sellTarget.rat>=86&&<div style={{padding:"9px 12px",background:"#fff7ed",border:"1px solid #fed7aa",borderRadius:8,fontSize:12,color:"#c2410c",marginBottom:12}}>⚠️ 주요 선수 매각 — 팬 지지도가 하락합니다</div>}
            {/* ── 이적 방식 비교 안내 ── */}
            <div style={{padding:"10px 12px",background:"#f8fafc",border:`1px solid ${C.border}`,borderRadius:8,marginBottom:12}}>
              <div style={{fontSize:11,fontWeight:700,color:C.textMd,marginBottom:6}}>매각 방식 비교</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,fontSize:11}}>
                <div style={{padding:"6px 8px",background:"#eff6ff",borderRadius:6,border:"1px solid #bfdbfe"}}>
                  <div style={{fontWeight:700,color:C.primary,marginBottom:2}}>📋 이적시장 등록</div>
                  <div style={{color:C.textMd,lineHeight:1.5}}>희망가 {fmt(sellOffer)}<br/>다음 경기 후 오퍼 통보<br/>타결 시 85~115% 수령</div>
                </div>
                <div style={{padding:"6px 8px",background:"#fff5f5",borderRadius:6,border:"1px solid #fecaca"}}>
                  <div style={{fontWeight:700,color:C.danger,marginBottom:2}}>⚡ 즉시 방출</div>
                  <div style={{color:C.textMd,lineHeight:1.5}}>즉시 {fmt(Math.round(sellOffer*0.8))}<br/>(희망가의 80%)<br/>협상 과정 없이 즉결</div>
                </div>
              </div>
            </div>
            <div style={{padding:"12px",background:"#fefce8",border:"1px solid #fde68a",borderRadius:10,marginBottom:14}}>
              <div style={{fontSize:12,fontWeight:700,color:"#92400e",marginBottom:8}}>📰 가짜뉴스로 매각가 협상력 올리기 {fakeUsed&&<span style={{fontSize:10,fontWeight:400,color:"#a16207"}}>(이번 시즌 사용됨)</span>}</div>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                {FAKE_TEMPLATES.map(tmpl=>(
                  <button key={tmpl.id} disabled={fakeUsed} onClick={()=>{
                    const teams=[selTeam,...ALL_TEAMS.filter(t=>t.id!==selTeam.id).sort(()=>Math.random()-0.5).slice(0,2)];
                    const headline=tmpl.fn(sellTarget,teams);
                    addNews(headline,"fake");
                    addNews(`🗞️ 외신들 후속 보도 — "${sellTarget.name} 이적 루머 확산 중..."`,"fake");
                    const priceEffect={interest:1.18,sell:0.88,bid:1.25,medical:1.30,reject:0.92,hijack:1.15}[tmpl.id]||1.0;
                    if(priceEffect!==1.0){
                      const dir=priceEffect>1?"+":"";
                      const pct=Math.round((priceEffect-1)*100);
                      addNews(`💹 [시장반응] ${sellTarget.name} 몸값 ${dir}${pct}% 변동`,"fake");
                      const newVal=parseFloat((sellTarget.val*priceEffect).toFixed(1));
                      setSquad(prev=>prev.map(p=>p.id===sellTarget.id?{...p,val:newVal,bubble:priceEffect>1.1}:p));
                      setSellTarget(prev=>({...prev,val:newVal,bubble:priceEffect>1.1}));
                      setSellOffer(prev=>Math.round(prev*priceEffect));
                    }
                    setFakeUsed(true);
                    notify(`가짜뉴스 유포! 매각가가 변동되었습니다`,"success");
                  }} style={{fontSize:11,padding:"5px 10px",borderRadius:7,border:"1px solid #fde68a",background:fakeUsed?"#f1f5f9":"#fff",cursor:fakeUsed?"not-allowed":"pointer",fontFamily:"inherit",color:fakeUsed?"#aaa":"#92400e",opacity:fakeUsed?0.6:1}}>{tmpl.label}</button>
                ))}
              </div>
              <div style={{fontSize:10,color:"#a16207",marginTop:6}}>※ 시즌 1회만 사용 가능 · 유형에 따라 몸값이 즉시 변동됩니다 (협상력에 반영)</div>
            </div>
            <div style={{display:"flex",gap:10}}>
              <button onClick={()=>listPlayerForSale(sellTarget,sellOffer)} style={{...BTN_PRIMARY,flex:1,padding:"11px",fontSize:13}}>📋 이적시장 등록<br/><span style={{fontSize:10,fontWeight:400,opacity:0.85}}>다음주 오퍼 대기</span></button>
              <button onClick={()=>confirmSell(sellTarget,Math.round(sellOffer*0.8))} style={{...BTN_DANGER,flex:1,padding:"11px",fontSize:13}}>⚡ 즉시 방출<br/><span style={{fontSize:10,fontWeight:400,opacity:0.85}}>{fmt(Math.round(sellOffer*0.8))} (80%)</span></button>
              <button onClick={()=>{setShowSell(false);setSellTarget(null);}} style={{...BTN_CANCEL,padding:"11px 14px",fontSize:13}}>취소</button>
            </div>
          </div>
        </div>
      )}

      {/* ══ 🏟️ 구단 거절 모달 ══ */}
      {showClubReject&&clubRejectInfo&&(
        <div style={MODAL_OVERLAY}>
          <div style={{...MODAL_BOX,maxWidth:420}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
              <span style={{fontWeight:700,fontSize:17}}>🚫 원 소속 구단 이적 거부</span>
              <button onClick={()=>{setShowClubReject(false);setClubRejectInfo(null);}} style={{...BTN_WHITE,padding:"4px 12px",fontSize:13}}>✕</button>
            </div>
            <div style={{padding:"12px",background:"#fff5f5",border:"1.5px solid #fecaca",borderRadius:10,marginBottom:14}}>
              <div style={{fontWeight:700,fontSize:15,marginBottom:4,color:C.danger}}>⛔ {ALL_TEAMS.find(t=>t.id===clubRejectInfo.player.club)?.name||clubRejectInfo.player.club}</div>
              <div style={{fontSize:13,color:"#555",lineHeight:1.6}}>
                "<strong>{clubRejectInfo.player.name}</strong>은(는) 우리 팀 핵심 선수입니다.<br/>어떤 금액에도 이적 논의를 허용하지 않겠습니다."
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:14}}>
              {[["내 제안",fmt(clubRejectInfo.offer)],["바이아웃 금액",fmt(clubRejectInfo.buyoutFee)]].map(([k,v])=>(
                <div key={k} style={CARD}><div style={{fontSize:10,color:C.textSm,marginBottom:2}}>{k}</div><div style={{fontWeight:700,fontSize:14,color:k==="바이아웃 금액"?C.danger:C.primary}}>{v}</div></div>
              ))}
            </div>
            <div style={{padding:"10px 12px",background:"#fefce8",border:"1px solid #fde68a",borderRadius:8,fontSize:12,color:"#92400e",marginBottom:14,lineHeight:1.6}}>
              💡 <strong>바이아웃</strong>이란? 계약서에 명시된 위약금을 전액 지불하면 구단 동의 없이 즉시 영입 가능합니다.<br/>
              현재 바이아웃: <strong style={{color:C.danger}}>{fmt(clubRejectInfo.buyoutFee)}</strong> {budget>=clubRejectInfo.buyoutFee?"— 예산 충분":"— ⚠️ 예산 부족"}
            </div>
            <div style={{display:"flex",gap:10}}>
              {budget>=clubRejectInfo.buyoutFee?(
                <button onClick={()=>{
                  const{player,buyoutFee,contractYears:yrs}=clubRejectInfo;
                  if(buyoutFee>budget){notify("예산 초과!","error");return;}
                  const cappedWage=player.isIcon?20:getCappedWage(player.wage,yrs||contractYears);
                  const currentWageTotal=squad.reduce((s,p)=>s+p.wage,0);
                  const salaryCap=getSalaryCap(selTeam)+permWageBonus;
                  if(currentWageTotal+cappedWage>salaryCap)notify(`⚠️ 연봉상한선 초과!`,"error");
                  setBudget(prev=>parseFloat((prev-buyoutFee).toFixed(1)));
                  addNews(`💥 ${player.name} 바이아웃 발동! ${fmt(buyoutFee)} 지불 — 구단 강제 이적`,"drama");
                  finalizeTransfer(player,buyoutFee,cappedWage,yrs||contractYears);
                }} style={{...BTN_DANGER,flex:1,padding:"11px",fontSize:13}}>💥 바이아웃 발동 ({fmt(clubRejectInfo.buyoutFee)})</button>
              ):(
                <div style={{flex:1,padding:"11px",background:"#f1f5f9",borderRadius:8,fontSize:12,color:"#888",textAlign:"center"}}>예산 부족 — 바이아웃 불가</div>
              )}
              <button onClick={()=>{setShowClubReject(false);setClubRejectInfo(null);setShowNeg(true);}} style={{...BTN_WHITE,padding:"11px 14px",fontSize:12}}>↩ 제안 재조정</button>
              <button onClick={()=>{setShowClubReject(false);setClubRejectInfo(null);}} style={{...BTN_CANCEL,padding:"11px 14px",fontSize:12}}>포기</button>
            </div>
          </div>
        </div>
      )}

      {/* ══ 🤝 선수 연봉 카운터오퍼 모달 ══ */}
      {showPlayerWageDemand&&playerWageDemandInfo&&(
        <div style={MODAL_OVERLAY}>
          <div style={{...MODAL_BOX,maxWidth:420}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
              <span style={{fontWeight:700,fontSize:17}}>🤝 선수 연봉 협상</span>
              <button onClick={()=>{setShowPlayerWageDemand(false);setPlayerWageDemandInfo(null);}} style={{...BTN_WHITE,padding:"4px 12px",fontSize:13}}>✕</button>
            </div>
            <div style={{padding:"12px",background:"#f0fdf4",border:"1.5px solid #bbf7d0",borderRadius:10,marginBottom:14,display:"flex",gap:12,alignItems:"center"}}>
              <div style={{width:44,height:44,borderRadius:"50%",background:"#16a34a",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:18,color:"#fff",flexShrink:0}}>{playerWageDemandInfo.player.rat}</div>
              <div>
                <div style={{fontWeight:700,fontSize:15}}>{playerWageDemandInfo.player.name}</div>
                <div style={{fontSize:12,color:"#555"}}>{playerWageDemandInfo.player.pos} · {playerWageDemandInfo.player.age}세 · 명성 {playerWageDemandInfo.player.fame}</div>
              </div>
            </div>
            <div style={{padding:"12px",background:"#fff7ed",border:"1px solid #fed7aa",borderRadius:10,marginBottom:14}}>
              <div style={{fontSize:13,color:"#c2410c",fontWeight:700,marginBottom:6}}>💬 에이전트 메시지</div>
              <div style={{fontSize:13,color:"#555",lineHeight:1.6}}>
                "구단 측 이적료 협상은 완료되었습니다. 그러나 선수는 현재 제시 연봉보다 높은 조건을 요구하고 있습니다.<br/>
                <strong>최소 €{playerWageDemandInfo.demandWage}M/주</strong>가 보장되지 않으면 이적을 거부할 수 있습니다."
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:14}}>
              {[["내 제시 연봉",`€${playerWageDemandInfo.cappedWage}M/주`],["선수 요구 연봉",`€${playerWageDemandInfo.demandWage}M/주`]].map(([k,v])=>(
                <div key={k} style={{...CARD,border:k==="선수 요구 연봉"?`1.5px solid #fca5a5`:undefined}}>
                  <div style={{fontSize:10,color:C.textSm,marginBottom:2}}>{k}</div>
                  <div style={{fontWeight:700,fontSize:14,color:k==="선수 요구 연봉"?C.danger:C.success}}>{v}</div>
                </div>
              ))}
            </div>
            <div style={{fontSize:11,color:C.textSm,marginBottom:14,padding:"8px 10px",background:C.bg,borderRadius:8}}>
              📋 이적료 <strong>{fmt(playerWageDemandInfo.finalFee)}</strong> · 계약 <strong>{playerWageDemandInfo.contractYears}년</strong>
              {playerWageDemandInfo.panicMsg&&<span style={{color:C.warn}}> {playerWageDemandInfo.panicMsg}</span>}
            </div>
            <div style={{display:"flex",gap:10}}>
              <button onClick={acceptPlayerWageDemand} style={{...BTN_SUCCESS,flex:1,padding:"11px",fontSize:13}}>✅ 요구 연봉 수락<br/><span style={{fontSize:10,fontWeight:400}}>€{playerWageDemandInfo.demandWage}M/주</span></button>
              <button onClick={rejectPlayerWageDemand} style={{...BTN_WHITE,flex:1,padding:"11px",fontSize:13}}>🎲 낮은 연봉 강행<br/><span style={{fontSize:10,color:C.warn,fontWeight:400}}>50% 이적 취소 위험</span></button>
              <button onClick={()=>{setShowPlayerWageDemand(false);setPlayerWageDemandInfo(null);}} style={{...BTN_CANCEL,padding:"11px 14px",fontSize:12}}>포기</button>
            </div>
          </div>
        </div>
      )}

      {/* ══ 📋 매각 오퍼 결과 모달 ══ */}
      {showSaleResult&&saleResultInfo&&(
        <div style={MODAL_OVERLAY}>
          <div style={{...MODAL_BOX,maxWidth:380}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
              <span style={{fontWeight:700,fontSize:17}}>{saleResultInfo.sold?"💰 이적 협상 타결!":"📭 오퍼 없음"}</span>
              <button onClick={()=>{setShowSaleResult(false);setSaleResultInfo(null);}} style={{...BTN_WHITE,padding:"4px 12px",fontSize:13}}>✕</button>
            </div>
            {saleResultInfo.sold?(
              <>
                <div style={{padding:"14px",background:"#f0fdf4",border:"1.5px solid #bbf7d0",borderRadius:10,marginBottom:14,textAlign:"center"}}>
                  <div style={{fontSize:22,marginBottom:4}}>🎉</div>
                  <div style={{fontWeight:700,fontSize:15,marginBottom:2}}>{saleResultInfo.player.name}</div>
                  <div style={{fontSize:13,color:C.textSm,marginBottom:8}}>구단 간 이적 협상 타결</div>
                  <div style={{fontSize:24,fontWeight:800,color:C.success}}>{fmt(saleResultInfo.actualFee)}</div>
                  <div style={{fontSize:11,color:C.textSm,marginTop:2}}>희망가: {fmt(saleResultInfo.askFee)} ({Math.round(saleResultInfo.actualFee/saleResultInfo.askFee*100)}%)</div>
                </div>
              </>
            ):(
              <>
                <div style={{padding:"14px",background:"#fff5f5",border:"1.5px solid #fecaca",borderRadius:10,marginBottom:14,textAlign:"center"}}>
                  <div style={{fontSize:22,marginBottom:4}}>📭</div>
                  <div style={{fontWeight:700,fontSize:15,marginBottom:4}}>{saleResultInfo.player.name}</div>
                  <div style={{fontSize:13,color:C.textMd,lineHeight:1.6}}>이번 주에는 공식 오퍼가 없었습니다.<br/>희망가 <strong>{fmt(saleResultInfo.askFee)}</strong>를 낮추거나<br/>다음 경기까지 대기하세요.</div>
                </div>
                <div style={{display:"flex",gap:8,marginBottom:14}}>
                  <button onClick={()=>{
                    const newAsk=Math.round(saleResultInfo.askFee*0.85);
                    setPendingSales(prev=>prev.map(s=>s.player.id===saleResultInfo.player.id?{...s,askFee:newAsk,listedWeek:week}:s));
                    addNews(`📉 ${saleResultInfo.player.name} 희망 이적료 하향 조정: ${fmt(saleResultInfo.askFee)} → ${fmt(newAsk)}`,"transfer");
                    notify(`희망가 -15% 조정`,"info");
                    setShowSaleResult(false);setSaleResultInfo(null);
                  }} style={{...BTN_DANGER,flex:1,padding:"9px",fontSize:12}}>📉 -15% 낮추기<br/><span style={{fontSize:10,fontWeight:400}}>{fmt(Math.round(saleResultInfo.askFee*0.85))}</span></button>
                  <button onClick={()=>{
                    setPendingSales(prev=>prev.filter(s=>s.player.id!==saleResultInfo.player.id));
                    setSquad(prev=>prev.map(s=>s.id===saleResultInfo.player.id?{...s,leave:false}:s));
                    addNews(`🔄 ${saleResultInfo.player.name} 이적 시장 등록 철회`,"transfer");
                    notify(`이적 시장 등록 취소`,"info");
                    setShowSaleResult(false);setSaleResultInfo(null);
                  }} style={{...BTN_CANCEL,flex:1,padding:"9px",fontSize:12}}>🔄 등록 취소</button>
                </div>
              </>
            )}
            <button onClick={()=>{setShowSaleResult(false);setSaleResultInfo(null);}} style={{...BTN_PRIMARY,width:"100%",padding:"10px",fontSize:13}}>확인</button>
          </div>
        </div>
      )}


      {/* ══ 임대 영입 모달 ══ */}
      {showLoanModal&&loanTarget&&(
        <div style={MODAL_OVERLAY}>
          <div style={{...MODAL_BOX,maxWidth:400}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
              <span style={{fontWeight:700,fontSize:17}}>📋 임대 영입</span>
              <button onClick={()=>{setShowLoanModal(false);setLoanTarget(null);}} style={{...BTN_WHITE,padding:"4px 12px",fontSize:13}}>✕</button>
            </div>
            <div style={{padding:"12px",background:"#eff6ff",border:"1.5px solid #bfdbfe",borderRadius:10,marginBottom:14,display:"flex",gap:12,alignItems:"center"}}>
              <div style={{width:44,height:44,borderRadius:"50%",background:"#2563eb",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:18,color:"#fff",flexShrink:0}}>{loanTarget.rat}</div>
              <div>
                <div style={{fontWeight:700,fontSize:15}}>{loanTarget.name}</div>
                <div style={{fontSize:12,color:"#555"}}>{loanTarget.pos} · {loanTarget.age}세 · 주급 €{loanTarget.wage}M</div>
              </div>
            </div>
            <div style={{marginBottom:14}}>
              <div style={{fontSize:13,fontWeight:600,marginBottom:8}}>연봉 부담 비율 (유저 부담: {loanWageSplit}%)</div>
              <input type="range" min={30} max={100} step={5} value={loanWageSplit} onChange={e=>setLoanWageSplit(Number(e.target.value))} style={{width:"100%",accentColor:"#2563eb"}}/>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:C.textSm,marginTop:4}}>
                <span>원 구단 {100-loanWageSplit}% = €{(loanTarget.wage*(100-loanWageSplit)/100).toFixed(1)}M</span>
                <span>내 부담 {loanWageSplit}% = €{(loanTarget.wage*loanWageSplit/100).toFixed(1)}M</span>
              </div>
            </div>
            <div style={{padding:"10px 12px",background:"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:8,fontSize:12,marginBottom:14}}>
              💡 임대 기간: 1시즌 · 이적료 없음 · 시즌 후 원 구단 복귀
            </div>
            <div style={{display:"flex",gap:10}}>
              <button onClick={()=>{
                if(squad.length>=30){notify("스쿼드 만원","error");return;}
                const wage=parseFloat((loanTarget.wage*loanWageSplit/100).toFixed(1));
                const cappedWage=getCappedWage(wage,1);
                setSquad(prev=>[...prev,{...loanTarget,wage:cappedWage,club:selTeam.id,isLoan:true,contractEndSeason:season+1}]);
                setLoanPlayers(prev=>[...prev,{player:loanTarget,wageSplit:loanWageSplit,fromClub:loanTarget.club}]);
                addNews(`📋 ${loanTarget.name} 임대 영입 완료 (연봉 ${loanWageSplit}% 부담 = €${wage}M/주)`,"transfer");
                notify(`${loanTarget.name} 임대 영입!`,"success");
                setShowLoanModal(false);setLoanTarget(null);
              }} style={{...BTN_PRIMARY,flex:1,padding:"11px",fontSize:13}}>📋 임대 확정</button>
              <button onClick={()=>{setShowLoanModal(false);setLoanTarget(null);}} style={{...BTN_CANCEL,padding:"11px 16px",fontSize:13}}>취소</button>
            </div>
          </div>
        </div>
      )}
      {/* ══ 스카우트 분석가 모달 ══ */}
      {showAnalyst&&(()=>{
        // ── 포지션 그룹 평점 분석 ──
        const POS_LABEL={GK:"골키퍼",CB:"센터백",LB:"좌측백",RB:"우측백",CDM:"수비형MF",CM:"중앙MF",CAM:"공격형MF",LW:"좌측윙",RW:"우측윙",ST:"스트라이커",CF:"공격형FW"};
        const allPos=["GK","CB","LB","RB","CDM","CM","CAM","LW","RW","ST","CF"];
        // 포지션별 스쿼드 평균 평점
        const posStats=allPos.map(pos=>{
          const players=squad.filter(p=>p.pos===pos&&!injured.includes(p.id));
          const injured_players=squad.filter(p=>p.pos===pos&&injured.includes(p.id));
          const avgRat=players.length>0?players.reduce((s,p)=>s+p.rat,0)/players.length:0;
          const avgRating=players.length>0?players.reduce((s,p)=>s+(playerRatings[p.id]?.avg||0),0)/players.length:0;
          const count=players.length;
          const injCount=injured_players.length;
          const topPlayer=players.sort((a,b)=>b.rat-a.rat)[0];
          const avgAge=players.length>0?players.reduce((s,p)=>s+p.age,0)/players.length:0;
          return{pos,label:POS_LABEL[pos]||pos,avgRat,avgRating,count,injCount,topPlayer,avgAge:Math.round(avgAge)};
        });
        // 취약 포지션 = "진짜로" 보강이 필요한 곳만 (인원부족/평균이하/부상다수/노쇠화)
        const squadAvgRat=squad.length>0?squad.reduce((s,p)=>s+p.rat,0)/squad.length:75;
        const weakPos=posStats
          .filter(p=>p.count>0)
          .map(p=>({...p,score: p.avgRat*0.5 + (p.count>=2?0:(-10)) + (p.avgRating>0?p.avgRating*0.3:0) - (p.injCount*3) - (p.avgAge>30?3:0) }))
          .filter(p=>
            p.count<2 ||                          // 인원 부족 (뎁스 부족)
            p.avgRat < squadAvgRat-1.5 ||         // 스쿼드 평균보다 평점 낮음
            p.injCount>=2 ||                      // 부상자 다수
            (p.avgAge>=31&&p.count<3)             // 노쇠화 + 뎁스 부족
          )
          .sort((a,b)=>a.score-b.score)
          .slice(0,4);
        const emptyPos=posStats.filter(p=>p.count===0);
        const squadIsBalanced=weakPos.length===0&&emptyPos.length===0;
        // 추천 선수 생성 (취약 포지션에 맞는 마켓 선수)
        const recommendations=[];
        const targetPositions=emptyPos.length>0?emptyPos.map(p=>p.pos):weakPos.map(p=>p.pos);
        targetPositions.slice(0,4).forEach(pos=>{
          // 해당 포지션 마켓 선수 중 예산 내에서 가장 좋은 선수들
          const candidates=ALL_PLAYERS
            .filter(p=>p.pos===pos&&p.club!==selTeam?.id&&!squad.find(s=>s.id===p.id))
            .sort((a,b)=>b.rat-a.rat);
          // 예산 범위별로 3단계 추천
          const affordable=candidates.filter(p=>getMarketVal(p)<=budget);
          const stretch=candidates.filter(p=>getMarketVal(p)>budget&&getMarketVal(p)<=budget*1.5);
          const premium=candidates.filter(p=>getMarketVal(p)>budget*1.5).slice(0,2);
          if(affordable.length>0)recommendations.push({pos,tier:"적정",player:affordable[0],reason:"예산 내 최고 옵션",canBuy:true});
          if(affordable.length>1)recommendations.push({pos,tier:"가성비",player:affordable.find(p=>p.age<=24&&p.pot>=p.rat+2)||affordable[1],reason:"잠재력 우선 선발",canBuy:true});
          if(stretch.length>0)recommendations.push({pos,tier:"추가예산",player:stretch[0],reason:"약간의 추가 투자 필요",canBuy:false});
        });
        // 스쿼드 전반 진단 메시지
        const avgTeamRat=squadAvgRat.toFixed(1);
        const injRate=squad.length>0?(injured.length/squad.length*100).toFixed(0):0;
        const ageWarn=squad.filter(p=>p.age>=33).length;
        const youngGems=squad.filter(p=>p.age<=22&&p.pot>=82).length;
        return(
          <div style={MODAL_OVERLAY}>
            <div style={{...MODAL_BOX,maxWidth:680}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
                <div>
                  <div style={{fontWeight:700,fontSize:18}}>🔭 스카우트 분석관 리포트</div>
                  <div style={{fontSize:12,color:C.textSm,marginTop:2}}>시즌 {season} · {week}주차 기준 분석</div>
                </div>
                <button onClick={()=>setShowAnalyst(false)} style={{...BTN_WHITE,padding:"5px 14px",fontSize:13}}>✕</button>
              </div>
              {/* 팀 종합 진단 */}
              <div style={{background:"linear-gradient(135deg,#1e3a5f,#2563eb)",borderRadius:12,padding:"14px 16px",marginBottom:16,color:"#fff"}}>
                <div style={{fontWeight:700,fontSize:14,marginBottom:10}}>📊 팀 종합 진단</div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
                  {[
                    {l:"스쿼드 평균",v:`${avgTeamRat}`,s:"OVR",c:"#7dd3fc"},
                    {l:"부상 비율",v:`${injRate}%`,s:injRate>20?"위험":"정상",c:injRate>20?"#fca5a5":"#86efac"},
                    {l:"노장 선수",v:`${ageWarn}명`,s:"33세 이상",c:ageWarn>4?"#fca5a5":"#7dd3fc"},
                    {l:"유망주",v:`${youngGems}명`,s:"22세↓ pot82+",c:"#86efac"},
                  ].map(item=>(
                    <div key={item.l} style={{background:"rgba(255,255,255,0.1)",borderRadius:8,padding:"10px",textAlign:"center"}}>
                      <div style={{fontSize:11,color:"rgba(255,255,255,0.7)",marginBottom:3}}>{item.l}</div>
                      <div style={{fontSize:20,fontWeight:700,color:item.c}}>{item.v}</div>
                      <div style={{fontSize:10,color:"rgba(255,255,255,0.6)"}}>{item.s}</div>
                    </div>
                  ))}
                </div>
              </div>
              {/* 포지션별 강도 맵 */}
              <div style={{background:C.bg,border:`1px solid ${C.border}`,borderRadius:10,padding:"14px",marginBottom:16}}>
                <div style={{fontWeight:700,fontSize:14,marginBottom:10}}>🗺️ 포지션별 스쿼드 강도</div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(130px,1fr))",gap:6}}>
                  {posStats.map(p=>{
                    const isWeak=weakPos.find(w=>w.pos===p.pos);
                    const isEmpty=p.count===0;
                    const barColor=isEmpty?"#dc2626":p.avgRat>=82?"#16a34a":p.avgRat>=77?"#d97706":"#dc2626";
                    const bg=isEmpty?"#fff5f5":isWeak?"#fefce8":"#fff";
                    const border=isEmpty?"#fecaca":isWeak?"#fde68a":"#e2e8f0";
                    return(
                      <div key={p.pos} style={{background:bg,border:`1.5px solid ${border}`,borderRadius:8,padding:"8px 10px"}}>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                          <span style={{fontSize:11,fontWeight:700,color:C.text}}>{p.pos}</span>
                          {isEmpty?<span style={{fontSize:9,background:"#fecaca",color:C.danger,padding:"1px 5px",borderRadius:4,fontWeight:700}}>없음</span>:
                           isWeak?<span style={{fontSize:9,background:"#fde68a",color:"#854d0e",padding:"1px 5px",borderRadius:4,fontWeight:700}}>취약</span>:
                           <span style={{fontSize:9,background:"#dcfce7",color:"#166534",padding:"1px 5px",borderRadius:4,fontWeight:700}}>양호</span>}
                        </div>
                        <div style={{fontSize:14,fontWeight:700,color:barColor}}>{isEmpty?"0":p.avgRat.toFixed(1)}</div>
                        <div style={{fontSize:9,color:C.textSm,marginTop:2}}>{p.count}명 {p.injCount>0?`(부상 ${p.injCount})`:""}</div>
                        <div style={{height:4,background:"#e2e8f0",borderRadius:2,marginTop:4}}>
                          <div style={{height:"100%",width:`${isEmpty?0:Math.min(100,(p.avgRat-60)/40*100)}%`,background:barColor,borderRadius:2}}/>
                        </div>
                        {p.topPlayer&&<div style={{fontSize:9,color:"#555",marginTop:3,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.topPlayer.name.length>8?p.topPlayer.name.slice(0,7)+"…":p.topPlayer.name}</div>}
                      </div>
                    );
                  })}
                </div>
              </div>
              {/* 영입 추천 */}
              <div style={{marginBottom:14}}>
                <div style={{fontWeight:700,fontSize:14,marginBottom:6}}>🎯 분석관 영입 추천</div>
                <div style={{fontSize:12,color:C.textSm,marginBottom:10}}>취약 포지션 기준 · 예산 <strong style={{color:C.success}}>{fmt(budget)}</strong> 내외</div>
                {emptyPos.length>0&&(
                  <div style={{padding:"10px 14px",background:"#fff5f5",border:"1px solid #fecaca",borderRadius:8,marginBottom:10,fontSize:12,color:C.danger,fontWeight:600}}>
                    ⚠️ 선수가 없는 포지션: {emptyPos.map(p=>p.pos).join(", ")} — 즉시 보강 필요!
                  </div>
                )}
                {squadIsBalanced&&(
                  <div style={{padding:"16px",background:"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:8,fontSize:13,color:C.success,fontWeight:600,textAlign:"center"}}>
                    ✅ 모든 포지션이 양호합니다! 현재 추가 영입이 필요하지 않습니다.
                  </div>
                )}
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                  {recommendations.slice(0,6).map((rec,i)=>{
                    if(!rec||!rec.player)return null;
                    const p=rec.player;
                    const realVal=getMarketVal(p);
                    const canAfford=budget>=realVal*0.65;
                    const ageColor=p.age<=22?"#7c3aed":p.age<=27?"#16a34a":p.age<=30?"#d97706":"#dc2626";
                    const tierColor=rec.tier==="적정"?"#2563eb":rec.tier==="가성비"?"#7c3aed":rec.tier==="추가예산"?"#d97706":"#dc2626";
                    return(
                      <div key={`${rec.pos}-${rec.tier}-${i}`} style={{background:C.surface,border:`1.5px solid ${canAfford?"#bfdbfe":"#e2e8f0"}`,borderRadius:10,padding:"12px"}}>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
                          <div style={{flex:1}}>
                            <div style={{display:"flex",gap:5,alignItems:"center",marginBottom:3}}>
                              <span style={{fontSize:9,background:`${tierColor}18`,color:tierColor,padding:"1px 7px",borderRadius:10,fontWeight:700,border:`1px solid ${tierColor}44`}}>{rec.tier}</span>
                              <span style={{fontSize:9,background:"#f1f5f9",color:"#64748b",padding:"1px 6px",borderRadius:4,fontWeight:600}}>{rec.pos}</span>
                            </div>
                            <div style={{fontWeight:700,fontSize:13,color:C.text}}>{p.name}</div>
                            <div style={{fontSize:10,color:C.textSm}}>{p.nat} · <span style={{color:ageColor,fontWeight:600}}>{p.age}세</span> · 잠재력 <strong style={{color:"#2563eb"}}>{p.pot}</strong></div>
                          </div>
                          <div style={{width:38,height:38,borderRadius:"50%",background:getPlayerAvatar(p.pos),display:"flex",alignItems:"center",justifyContent:"center",fontWeight:800,fontSize:14,color:"#fff",flexShrink:0}}>{p.rat}</div>
                        </div>
                        <div style={{display:"flex",gap:3,marginBottom:7,fontSize:10}}>
                          {[["속",p.pace],["슈",p.sho],["패",p.pas],["드",p.dri],["수",p.def],["체",p.phy]].map(([k,v])=>(
                            <span key={k} style={{flex:1,textAlign:"center",background:C.bg,padding:"2px 3px",borderRadius:4,border:`1px solid ${C.border}`}}>
                              <span style={{display:"block",color:C.textSm,fontSize:8}}>{k}</span>
                              <strong style={{color:C.text,fontSize:10}}>{v}</strong>
                            </span>
                          ))}
                        </div>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",borderTop:"1px solid #f1f5f9",paddingTop:6}}>
                          <div>
                            <div style={{fontSize:12,fontWeight:700,color:canAfford?"#111":"#dc2626"}}>{fmt(realVal)}</div>
                            <div style={{fontSize:9,color:C.textSm}}>{rec.reason}</div>
                          </div>
                          <button onClick={()=>{
                            setTTarget(p);
                            setTOffer(Math.round(realVal));
                            setTOfferInput(String(Math.round(realVal)));
                            setShowNeg(true);
                            setShowAnalyst(false);
                          }} style={{...BTN_PRIMARY,padding:"5px 12px",fontSize:11,opacity:canAfford?1:0.5,cursor:canAfford?"pointer":"not-allowed",borderRadius:16}}>
                            협상 →
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              {/* 분석가 총평 */}
              <div style={{background:"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:10,padding:"12px 14px",marginBottom:14}}>
                <div style={{fontWeight:700,fontSize:13,color:"#166534",marginBottom:6}}>💬 분석관 총평</div>
                <div style={{fontSize:12,color:"#166534",lineHeight:1.6}}>
                  {(()=>{
                    const msgs=[];
                    if(emptyPos.length>0)msgs.push(`⚠️ ${emptyPos.map(p=>p.label||p.pos).join(", ")} 포지션에 선수가 없습니다. 즉시 보강이 필요합니다.`);
                    if(weakPos.length>0&&emptyPos.length===0)msgs.push(`📉 ${weakPos.slice(0,2).map(p=>p.label||p.pos).join(", ")} 라인이 팀 평균에 비해 약합니다.`);
                    if(ageWarn>3)msgs.push(`🎂 33세 이상 선수가 ${ageWarn}명입니다. 세대교체 계획이 필요합니다.`);
                    if(youngGems>0)msgs.push(`🌟 유망주 ${youngGems}명이 성장 중입니다. 인내심을 갖고 기용하세요.`);
                    if(injured.length>3)msgs.push(`🩹 부상자가 ${injured.length}명으로 스쿼드 깊이가 얕아졌습니다.`);
                    if(budget<50)msgs.push(`💸 잔여 예산이 적습니다. 매각 후 재투자를 고려하세요.`);
                    if(msgs.length===0)msgs.push(`✅ 현재 스쿼드는 전반적으로 균형이 잡혀 있습니다. 유지 전략을 추천합니다.`);
                    return msgs.map((m,i)=><div key={i} style={{marginBottom:4}}>{m}</div>);
                  })()}
                </div>
              </div>
              <button onClick={()=>setShowAnalyst(false)} style={{...BTN_PRIMARY,width:"100%",padding:"11px",fontSize:14}}>확인</button>
            </div>
          </div>
        );
      })()}
      {/* ══ 하이재킹 경쟁 모달 ══ */}
      {showHijackCompete&&hijackInfo&&(
        <div style={MODAL_OVERLAY}>
          <div style={{...MODAL_BOX,maxWidth:420}}>
            <div style={{textAlign:"center",marginBottom:14}}>
              <div style={{fontSize:32,marginBottom:6}}>⚔️</div>
              <div style={{fontWeight:700,fontSize:18,color:C.danger,marginBottom:4}}>하이재킹 경쟁!</div>
              <div style={{fontSize:13,color:"#555"}}><strong>{hijackInfo.hijackTeam.name}</strong>이 <strong style={{color:C.danger}}>€{hijackInfo.minBid-1}M</strong> 역제안!</div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
              <div style={{padding:"10px",background:"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:8,textAlign:"center"}}>
                <div style={{fontSize:10,color:C.textSm,marginBottom:2}}>내 제안</div>
                <div style={{fontSize:18,fontWeight:700,color:C.success}}>€{hijackInfo.yourOffer}M</div>
              </div>
              <div style={{padding:"10px",background:"#fff5f5",border:"1px solid #fecaca",borderRadius:8,textAlign:"center"}}>
                <div style={{fontSize:10,color:C.textSm,marginBottom:2}}>{hijackInfo.hijackTeam.name}</div>
                <div style={{fontSize:18,fontWeight:700,color:C.danger}}>€{hijackInfo.minBid-1}M</div>
              </div>
            </div>
            <div style={{marginBottom:12,padding:"12px",background:C.bg,border:`1px solid ${C.border}`,borderRadius:8}}>
              <div style={{fontSize:12,fontWeight:600,marginBottom:6}}>경쟁 입찰 (최소 €{hijackInfo.minBid}M 이상)</div>
              <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:6}}>
                <span style={{fontSize:12,color:C.textSm}}>€</span>
                <input type="number" min={hijackInfo.minBid} step={0.5} value={hijackBid} onChange={e=>setHijackBid(e.target.value)} style={{flex:1,padding:"6px 8px",border:"1px solid #d1d5db",borderRadius:6,fontSize:14,fontWeight:700}} autoFocus/>
                <span style={{fontSize:11,color:C.textSm}}>M</span>
              </div>
              <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                {[hijackInfo.minBid,Math.round(hijackInfo.minBid*1.1),Math.round(hijackInfo.minBid*1.2)].map(v=>(
                  <button key={v} onClick={()=>setHijackBid(String(v))} style={{fontSize:11,padding:"3px 8px",borderRadius:5,border:"1px solid #d1d5db",background:C.surface,cursor:"pointer",fontFamily:"inherit"}}>€{v}M</button>
                ))}
              </div>
            </div>
            {parseFloat(hijackBid)>budget&&<div style={{padding:"7px 10px",background:"#fff5f5",border:"1px solid #fecaca",borderRadius:6,fontSize:11,color:C.danger,marginBottom:8}}>⚠️ 예산 초과!</div>}
            <div style={{display:"flex",gap:8}}>
              <button onClick={()=>{
                const bid=parseFloat(hijackBid);
                if(isNaN(bid)||bid<hijackInfo.minBid){notify(`최소 €${hijackInfo.minBid}M 이상`,"error");return;}
                if(bid>budget){notify("예산 초과!","error");return;}
                const win=bid>=hijackInfo.minBid*1.15?0.85:bid>=hijackInfo.minBid*1.05?0.65:0.45;
                if(Math.random()<win){
                  setBudget(prev=>parseFloat((prev-bid).toFixed(1)));
                  setSquad(prev=>[...prev,{...hijackInfo.player,club:selTeam.id}]);
                  addNews(`🏆 하이재킹 경쟁 승리! ${hijackInfo.player.name} €${bid}M 영입!`,"transfer");
                  notify(`${hijackInfo.player.name} 영입 성공!`,"success");
                } else {
                  setHijackedPlayers(prev=>new Set([...prev,hijackInfo.player.id]));
                  addNews(`😞 경쟁 패배... ${hijackInfo.hijackTeam.name}이 ${hijackInfo.player.name} 영입`,"drama");
                  notify("경쟁 실패!","error");
                }
                setShowHijackCompete(false);setHijackInfo(null);setTTarget(null);
              }} style={{...BTN_PRIMARY,flex:1,padding:"10px",fontSize:13}}>⚔️ 입찰</button>
              <button onClick={()=>{setHijackedPlayers(prev=>new Set([...prev,hijackInfo.player.id]));setShowHijackCompete(false);setHijackInfo(null);setTTarget(null);notify("영입 포기","info");}} style={{...BTN_CANCEL,padding:"10px 14px",fontSize:13}}>포기</button>
            </div>
          </div>
        </div>
      )}
      {/* ══ 타팀 유스 스카우트 모달 ══ */}
      {showYouthScout&&(
        <div style={MODAL_OVERLAY}>
          <div style={{...MODAL_BOX,maxWidth:680}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
              <div>
                <div style={{fontWeight:700,fontSize:17}}>🔭 타팀 유스 스카우트</div>
                <div style={{fontSize:12,color:C.textSm,marginTop:2}}>다른 구단 유스 아카데미 유망주를 저비용으로 영입합니다</div>
              </div>
              <button onClick={()=>setShowYouthScout(false)} style={{...BTN_WHITE,padding:"4px 12px",fontSize:13}}>✕</button>
            </div>
            <div style={{maxHeight:480,overflowY:"auto",display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              {ALL_YOUTH_PLAYERS.filter(p=>p.club!==selTeam?.id).sort((a,b)=>b.pot-a.pot).slice(0,40).map(p=>{
                const fee=Math.max(0.5,parseFloat((getMarketVal(p)*0.4).toFixed(1)));
                const fromTeam=ALL_TEAMS.find(t=>t.id===p.club);
                const canAfford=budget>=fee;
                return(
                  <div key={p.id} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 10px",background:C.bg,border:`1px solid ${C.border}`,borderRadius:9}}>
                    <div style={{width:32,height:32,borderRadius:"50%",background:getPlayerAvatar(p.pos),display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:12,color:"#fff",flexShrink:0}}>{p.rat}</div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontWeight:600,fontSize:12}}>{p.name} <span style={{fontSize:10,color:C.textSm}}>{p.pos}</span></div>
                      <div style={{fontSize:10,color:C.textSm}}>{p.age}세 · {fromTeam?.name||p.club}</div>
                      <span style={{fontSize:9,padding:"1px 6px",borderRadius:4,background:"#f5f3ff",color:getPotI(p).color,border:`1px solid ${getPotI(p).color}44`,fontWeight:700}}>{getPotI(p).label}</span>
                    </div>
                    <div style={{textAlign:"right",flexShrink:0}}>
                      <div style={{fontSize:12,fontWeight:700,color:canAfford?"#16a34a":"#dc2626"}}>{fmt(fee)}</div>
                      <button onClick={()=>{
                        if(!canAfford){notify("예산 부족!","error");return;}
                        if(youthSquad.length>=12){notify("유스 아카데미 정원(12명) 초과","error");return;}
                        const idx=ALL_YOUTH_PLAYERS.findIndex(y=>y.id===p.id);
                        if(idx!==-1)ALL_YOUTH_PLAYERS.splice(idx,1);
                        const moved={...p,club:selTeam.id,id:`yt_${selTeam.id}_scout_${p.id}`};
                        ALL_YOUTH_PLAYERS.push(moved);
                        setYouthSquad(prev=>[...prev,moved]);
                        setBudget(prev=>parseFloat((prev-fee).toFixed(1)));
                        addNews(`🔭 ${fromTeam?.name||""} 유스 ${p.name} 영입! (${fmt(fee)})`,"transfer");
                        notify(`${p.name} 유스 영입 완료!`,"success");
                      }} style={{marginTop:3,padding:"3px 9px",fontSize:10,borderRadius:5,border:"1px solid #bfdbfe",background:canAfford?"#eff6ff":"#f1f5f9",cursor:canAfford?"pointer":"not-allowed",color:canAfford?"#2563eb":"#aaa",fontWeight:600}}>영입</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
      {/* ══ 유스 선수 상세 모달 ══ */}
      {showYouthDetail&&(
        <div style={MODAL_OVERLAY}>
          <div style={{...MODAL_BOX,maxWidth:380}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
              <span style={{fontWeight:700,fontSize:17}}>🌱 유스 선수 정보</span>
              <button onClick={()=>setShowYouthDetail(null)} style={{...BTN_WHITE,padding:"4px 12px",fontSize:13}}>✕ 닫기</button>
            </div>
            <div style={{display:"flex",gap:14,marginBottom:14,padding:"12px",background:"#f0fdf4",borderRadius:10,border:"1.5px solid #bbf7d0"}}>
              <div style={{width:56,height:56,borderRadius:"50%",background:getPlayerAvatar(showYouthDetail.pos),display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:22,color:"#fff",flexShrink:0}}>{showYouthDetail.rat}</div>
              <div>
                <div style={{fontWeight:700,fontSize:16}}>{showYouthDetail.name}</div>
                <div style={{fontSize:12,color:"#555"}}>{showYouthDetail.pos} · {showYouthDetail.age}세 · {showYouthDetail.nat}</div>
                <span style={{fontSize:11,background:getPotI(showYouthDetail).color,color:"#fff",padding:"3px 8px",borderRadius:6,fontWeight:700,marginTop:4,display:"inline-block"}}>{getPotI(showYouthDetail).label}</span>
              </div>
            </div>
            <div style={{marginBottom:14}}>
              {[["속도",showYouthDetail.pace,"#3b82f6"],["슈팅",showYouthDetail.sho,"#ef4444"],["패스",showYouthDetail.pas,"#10b981"],["드리블",showYouthDetail.dri,"#f59e0b"],["수비",showYouthDetail.def,"#6366f1"],["피지컬",showYouthDetail.phy,"#8b5cf6"]].map(([k,v,c])=>(
                <div key={k} style={{display:"flex",alignItems:"center",gap:8,marginBottom:5}}>
                  <span style={{fontSize:11,color:"#555",width:44,textAlign:"right",flexShrink:0}}>{k}</span>
                  <div style={{flex:1,height:9,background:"#e5e7eb",borderRadius:5}}><div style={{height:9,background:c,borderRadius:5,width:`${v}%`}}/></div>
                  <span style={{fontSize:12,fontWeight:700,width:26,flexShrink:0,color:c}}>{v}</span>
                </div>
              ))}
            </div>
            <div style={{display:"flex",gap:10}}>
              <button onClick={()=>{
                if(showYouthDetail.age<17){notify("17세 이상부터 1군 승격이 가능합니다","error");return;}
                if(squad.length>=30){notify("1군 스쿼드가 가득 찼습니다 (30명)","error");return;}
                setSquad(prev=>[...prev,{...showYouthDetail,club:selTeam.id,isVirtual:true,isYouth:undefined,promoted:true}]);
                setYouthSquad(prev=>prev.filter(y=>y.id!==showYouthDetail.id));
                {const gi=ALL_YOUTH_PLAYERS.findIndex(y=>y.id===showYouthDetail.id);if(gi!==-1)ALL_YOUTH_PLAYERS.splice(gi,1);}
                setPlayerConditions(prev=>({...prev,[showYouthDetail.id]:100}));
                addNews(`⬆️ ${showYouthDetail.name} 1군 승격! (${showYouthDetail.pos}, OVR ${showYouthDetail.rat})`,"system");
                notify(`${showYouthDetail.name} 1군 승격 완료!`,"success");
                setShowYouthDetail(null);
              }} disabled={showYouthDetail.age<17} style={{...BTN_PRIMARY,flex:1,padding:"10px",fontSize:13,opacity:showYouthDetail.age<17?0.5:1,cursor:showYouthDetail.age<17?"not-allowed":"pointer"}}>⬆️ {showYouthDetail.age<17?"승격불가 (17세 이상)":"1군 승격"}</button>
              <button onClick={()=>{
                setYouthSquad(prev=>prev.filter(y=>y.id!==showYouthDetail.id));
                {const gi=ALL_YOUTH_PLAYERS.findIndex(y=>y.id===showYouthDetail.id);if(gi!==-1)ALL_YOUTH_PLAYERS.splice(gi,1);}
                notify(`${showYouthDetail.name} 방출됨`,"info");
                setShowYouthDetail(null);
              }} style={{...BTN_CANCEL,padding:"10px 16px",fontSize:13}}>방출</button>
            </div>
          </div>
        </div>
      )}
      {/* ══ 선수 상세 모달 ══ */}
      {detail&&(
        <div style={MODAL_OVERLAY}>
          <div style={{...MODAL_BOX,maxWidth:420}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
              <span style={{fontWeight:700,fontSize:17}}>선수 정보</span>
              <button onClick={()=>setDetail(null)} style={{...BTN_WHITE,padding:"4px 12px",fontSize:13}}>✕ 닫기</button>
            </div>
            <div style={{display:"flex",gap:14,marginBottom:14,padding:"12px",background:"#f0f4ff",borderRadius:10,border:"1.5px solid #dbeafe"}}>
              <div style={{width:56,height:56,borderRadius:"50%",background:getPlayerAvatar(detail.pos),display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:22,color:"#fff",flexShrink:0}}>{detail.rat}</div>
              <div>
                <div style={{fontWeight:700,fontSize:17}}>{detail.name}</div>
                <div style={{fontSize:12,color:"#555",marginTop:2}}>{detail.pos} · {detail.age}세 · {detail.nat}</div>
                <div style={{fontSize:12,color:"#555"}}>€{detail.wage}M/주 · 시장가 <strong style={{color:"#2563eb"}}>{fmt(detail.val*15)}</strong></div>
                {/* OVR / POT 나란히 */}
                <div style={{display:"flex",gap:8,marginTop:6,alignItems:"center"}}>
                  <span style={{fontSize:11,background:"#1e293b",color:"#fff",padding:"3px 8px",borderRadius:6,fontWeight:700}}>OVR {detail.rat}</span>
                  <span style={{fontSize:11,background:getPotI(detail).color,color:"#fff",padding:"3px 8px",borderRadius:6,fontWeight:700}}>{getPotI(detail).label}</span>
                  {playerConditions[detail.id]!==undefined&&<span style={{fontSize:11,padding:"3px 8px",borderRadius:6,fontWeight:700,background:playerConditions[detail.id]>=70?"#16a34a":playerConditions[detail.id]>=45?"#d97706":"#dc2626",color:"#fff"}}>컨디션 {playerConditions[detail.id]}%</span>}
                  {detail.contract!==undefined&&(()=>{const c=detail.contract;const cColor=c>=3?C.success:c>=2?C.warn:C.danger;return<span style={{fontSize:11,padding:"3px 8px",borderRadius:6,fontWeight:700,background:`${cColor}18`,color:cColor,border:`1px solid ${cColor}44`}}>계약 {c}년 남음</span>;})()}

                </div>
              </div>
            </div>
            {/* ── SVG 레이더 차트 + 능력치 그리드 ── */}
            {(()=>{
              const stats=[detail.pace,detail.sho,detail.pas,detail.dri,detail.def,detail.phy];
              const labels=["속","슈","패","드","수","체"];
              const cx=55,cy=55,r=40;
              const pts=stats.map((v,i)=>{const a=(i*60-90)*Math.PI/180;const d=r*(v/100);return[cx+d*Math.cos(a),cy+d*Math.sin(a)];});
              const poly=pts.map(p=>p.join(",")).join(" ");
              const bgPts=Array.from({length:6},(_,i)=>{const a=(i*60-90)*Math.PI/180;return[cx+r*Math.cos(a),cy+r*Math.sin(a)];});
              const bgPoly=bgPts.map(p=>p.join(",")).join(" ");
              return(
                <div style={{display:"flex",gap:14,marginBottom:12,alignItems:"center"}}>
                  <svg width="110" height="110" viewBox="0 0 110 110" style={{flexShrink:0}}>
                    {[0.33,0.66,1.0].map(s=><polygon key={s} points={bgPts.map(p=>{const a2=Math.atan2(p[1]-cy,p[0]-cx);const d2=Math.sqrt((p[0]-cx)**2+(p[1]-cy)**2)*s;return[cx+d2*Math.cos(a2),cy+d2*Math.sin(a2)];}).map(p=>p.join(",")).join(" ")} fill="none" stroke="#e2e8f0" strokeWidth="0.7"/>)}
                    {bgPts.map((p,i)=><line key={i} x1={cx} y1={cy} x2={p[0]} y2={p[1]} stroke="#e2e8f0" strokeWidth="0.7"/>)}
                    <polygon points={poly} fill="#3b82f633" stroke="#3b82f6" strokeWidth="1.5"/>
                    {pts.map((p,i)=><circle key={i} cx={p[0]} cy={p[1]} r="2.5" fill="#3b82f6"/>)}
                    {stats.map((v,i)=>{const a=(i*60-90)*Math.PI/180;const lx=cx+(r+13)*Math.cos(a);const ly=cy+(r+13)*Math.sin(a);return<text key={i} x={lx} y={ly} textAnchor="middle" dominantBaseline="central" fontSize="9" fill="#64748b">{labels[i]}</text>;})}
                  </svg>
                  <div style={{flex:1,display:"grid",gridTemplateColumns:"1fr 1fr",gap:5}}>
                    {[["속도",detail.pace,"#3b82f6"],["슈팅",detail.sho,"#ef4444"],["패스",detail.pas,"#10b981"],["드리블",detail.dri,"#f59e0b"],["수비",detail.def,"#6366f1"],["피지컬",detail.phy,"#8b5cf6"]].map(([k,v,c])=>(
                      <div key={k} style={{padding:"4px 8px",borderRadius:6,background:v>=85?"#ecfdf5":v>=70?"#eff6ff":"#f8fafc",border:`1px solid ${v>=85?"#6ee7b7":v>=70?"#bfdbfe":"#e5e7eb"}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                        <span style={{fontSize:11,color:"#64748b"}}>{k}</span>
                        <span style={{fontSize:12,fontWeight:700,color:v>=85?"#059669":v>=70?"#2563eb":"#6b7280"}}>{v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginTop:12,marginBottom:14}}>
              {[["전성기 평점",`${detail.peak}(${detail.peakY})`],["명성",`${detail.fame}/100`],["부상 빈도",`${detail.inj}/10`],["잠재력",`${detail.pot||detail.rat}`],["이번 시즌",`${detail.goals}골/${detail.ast}도움`],["상태",detail.bubble?"⚠️거품":detail.leave?"🔓이적희망":"🔒이적반대"]].map(([k,v])=>(
                <div key={k} style={CARD}><div style={{fontSize:10,color:C.textSm,marginBottom:2}}>{k}</div><div style={{fontWeight:600,fontSize:13}}>{v}</div></div>
              ))}
            </div>
            {/* ── 포지션 변경 ── */}
            <div style={{background:C.bg,border:`1px solid ${C.border}`,borderRadius:10,padding:"12px",marginBottom:14}}>
              <div style={{fontSize:12,fontWeight:700,color:"#374151",marginBottom:8}}>🔀 포지션 변경 <span style={{fontSize:10,color:"#9ca3af",fontWeight:400}}>(현재: {detail.pos})</span></div>
              <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
                {["GK","CB","LB","RB","CDM","CM","CAM","LW","RW","CF","ST"].map(pos=>{
                  const isCurrent=pos===detail.pos;
                  const posColor=getPlayerAvatar(pos);
                  return(
                    <button key={pos} onClick={()=>{
                      if(isCurrent)return;
                      setSquad(prev=>prev.map(p=>p.id===detail.id?{...p,pos}:p));
                      setDetail(prev=>({...prev,pos}));
                      notify(`${detail.name} → ${pos} 포지션 변경 완료`,"success");
                      addNews(`🔀 ${detail.name} 포지션 변경: → ${pos}`,"system");
                    }} style={{
                      padding:"5px 10px",fontSize:11,borderRadius:7,border:isCurrent?`2px solid ${posColor}`:"1.5px solid #e2e8f0",
                      background:isCurrent?posColor:"#fff",color:isCurrent?"#fff":"#374151",
                      cursor:isCurrent?"default":"pointer",fontWeight:isCurrent?700:400,
                      fontFamily:"inherit"
                    }}>{pos}{isCurrent?" ✓":""}</button>
                  );
                })}
              </div>
              <div style={{fontSize:10,color:"#9ca3af",marginTop:6}}>※ 포지션 변경 시 능력치는 유지되지만 적합도가 달라질 수 있습니다</div>
            </div>
            <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
              <button onClick={()=>openSell(detail)} style={{...BTN_DANGER,flex:1,padding:"10px",fontSize:13}}>📤 매각하기</button>
              {detail.age<=26&&detail.pot>detail.rat&&!loanOutPlayers.find(l=>l.player.id===detail.id)&&(
                <button onClick={()=>{setLoanOutTarget(detail);setLoanOutSeasons(1);setLoanOutTeam(null);setShowLoanOut(true);setDetail(null);}} style={{...BTN_PRIMARY,flex:1,padding:"10px",fontSize:12}}>✈️ 임대 방출</button>
              )}
              <button onClick={()=>setDetail(null)} style={{...BTN_CANCEL,padding:"10px 16px",fontSize:13}}>닫기</button>
            </div>
          </div>
        </div>
      )}
      {/* ══ 유망주 임대 방출 모달 ══ */}
      {showLoanOut&&loanOutTarget&&(
        <div style={MODAL_OVERLAY}>
          <div style={{...MODAL_BOX,maxWidth:480}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
              <span style={{fontWeight:700,fontSize:17}}>✈️ 유망주 임대 방출</span>
              <button onClick={()=>{setShowLoanOut(false);setLoanOutTarget(null);}} style={{...BTN_WHITE,padding:"4px 12px",fontSize:13}}>✕</button>
            </div>
            {/* 선수 정보 */}
            <div style={{padding:"12px",background:"#eff6ff",border:"1.5px solid #bfdbfe",borderRadius:10,marginBottom:14,display:"flex",gap:12,alignItems:"center"}}>
              <div style={{width:48,height:48,borderRadius:"50%",background:getPlayerAvatar(loanOutTarget.pos),display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:18,color:"#fff",flexShrink:0}}>{loanOutTarget.rat}</div>
              <div>
                <div style={{fontWeight:700,fontSize:15}}>{loanOutTarget.name}</div>
                <div style={{fontSize:12,color:"#555"}}>{loanOutTarget.pos} · {loanOutTarget.age}세 · OVR {loanOutTarget.rat} → 잠재력 {loanOutTarget.pot}</div>
                <div style={{fontSize:11,color:C.textSm}}>성장 여지: <strong style={{color:C.primary}}>+{loanOutTarget.pot-loanOutTarget.rat}</strong></div>
              </div>
            </div>
            {/* 임대 기간 선택 */}
            <div style={{marginBottom:14}}>
              <div style={{fontSize:13,fontWeight:700,marginBottom:8}}>임대 기간</div>
              <div style={{display:"flex",gap:8}}>
                {[1,2,3].map(s=>(
                  <button key={s} onClick={()=>setLoanOutSeasons(s)} style={{flex:1,padding:"10px",borderRadius:8,border:`1.5px solid ${loanOutSeasons===s?C.primary:C.border}`,background:loanOutSeasons===s?C.primaryLt:"#fff",cursor:"pointer",fontFamily:"inherit",fontWeight:loanOutSeasons===s?700:400,fontSize:13,color:loanOutSeasons===s?C.primary:C.text}}>
                    {s}시즌
                    <div style={{fontSize:10,color:loanOutSeasons===s?C.primary:C.textSm,marginTop:2}}>{s===1?"빠른 복귀":s===2?"균형":s===3?"최대성장":"?"}</div>
                  </button>
                ))}
              </div>
            </div>
            {/* 임대 팀 선택 */}
            <div style={{marginBottom:14}}>
              <div style={{fontSize:13,fontWeight:700,marginBottom:8}}>임대 팀 선택 <span style={{fontSize:11,fontWeight:400,color:C.textSm}}>(리그 수준이 성장속도에 영향)</span></div>
              <div style={{maxHeight:200,overflowY:"auto",border:`1px solid ${C.border}`,borderRadius:8}}>
                {ALL_TEAMS.filter(t=>t.id!==selTeam?.id).sort((a,b)=>b.prestige-a.prestige).map(t=>{
                  const pres=t.prestige||5;
                  const growthDesc=pres>=9?"⚡ 최고 수준 — 백업 위주":pres>=7?"🔥 강팀 — 로테이션 기대":pres>=5?"✅ 중위권 — 주전 보장":"🌱 약팀 — 완전 주전";
                  return(
                    <div key={t.id} onClick={()=>setLoanOutTeam(t)} style={{padding:"9px 12px",cursor:"pointer",background:loanOutTeam?.id===t.id?"#eff6ff":"transparent",borderBottom:`1px solid ${C.bg}`,display:"flex",alignItems:"center",gap:10}}>
                      <ClubLogo teamId={t.id} size={20}/>
                      <div style={{flex:1}}>
                        <div style={{fontSize:12,fontWeight:600}}>{t.name}</div>
                        <div style={{fontSize:10,color:C.textSm}}>{growthDesc}</div>
                      </div>
                      <div style={{fontSize:10,color:C.textSm}}>Prestige {pres}</div>
                      {loanOutTeam?.id===t.id&&<span style={{color:C.primary,fontSize:16}}>✓</span>}
                    </div>
                  );
                })}
              </div>
            </div>
            {/* 성장 예상치 */}
            {loanOutTeam&&(()=>{
              const pres=loanOutTeam.prestige||5;
              const startProb=pres>=9?0.25:pres>=8?0.45:pres>=7?0.60:pres>=6?0.75:0.85;
              const estGames=Math.round(38*startProb*loanOutSeasons);
              const ageBase=loanOutTarget.age<=19?4:loanOutTarget.age<=21?3:loanOutTarget.age<=23?2:1;
              const estRat=Math.round((estGames/38)*ageBase*1.0*loanOutSeasons);
              const estPot=Math.round((estGames/38)*(ageBase*0.5)*0.75*loanOutSeasons);
              return(
                <div style={{padding:"10px 12px",background:"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:8,marginBottom:14,fontSize:12}}>
                  <div style={{fontWeight:700,color:"#166534",marginBottom:4}}>📊 예상 성장치 ({loanOutSeasons}시즌)</div>
                  <div style={{display:"flex",gap:12,color:"#166534"}}>
                    <span>예상 출전: <strong>~{estGames}경기</strong></span>
                    <span>OVR: <strong>+{estRat}</strong></span>
                    <span>POT: <strong>+{estPot}</strong></span>
                  </div>
                </div>
              );
            })()}
            <div style={{display:"flex",gap:10}}>
              <button disabled={!loanOutTeam} onClick={()=>{
                if(!loanOutTeam){notify("임대 팀을 선택하세요","error");return;}
                const loPlayer={...loanOutTarget,club:loanOutTeam.id,isLoanOut:true};
                setLoanOutPlayers(prev=>[...prev,{player:loPlayer,toTeam:loanOutTeam,seasons:loanOutSeasons,remainSeasons:loanOutSeasons,gamesPlayed:0,seasonStart:season}]);
                setSquad(prev=>prev.filter(p=>p.id!==loanOutTarget.id));
                const pidx=ALL_PLAYERS.findIndex(p=>p.id===loanOutTarget.id);
                if(pidx!==-1)ALL_PLAYERS[pidx]={...ALL_PLAYERS[pidx],club:loanOutTeam.id};
                addNews(`✈️ ${loanOutTarget.name} → ${loanOutTeam.name} ${loanOutSeasons}시즌 임대 방출! (OVR${loanOutTarget.rat}/POT${loanOutTarget.pot})`,"transfer");
                notify(`${loanOutTarget.name} 임대 방출 완료!`,"success");
                setShowLoanOut(false);setLoanOutTarget(null);
              }} style={{...BTN_PRIMARY,flex:1,padding:"11px",fontSize:13,opacity:loanOutTeam?1:0.4,cursor:loanOutTeam?"pointer":"not-allowed"}}>✈️ 임대 방출 확정</button>
              <button onClick={()=>{setShowLoanOut(false);setLoanOutTarget(null);}} style={{...BTN_CANCEL,padding:"11px 16px",fontSize:13}}>취소</button>
            </div>
          </div>
        </div>
      )}
      {/* ══ 가짜뉴스 모달 (클릭 선택형) ══ */}
      {showFake&&(
        <div style={MODAL_OVERLAY}>
          <div style={{...MODAL_BOX,maxWidth:500}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
              <span style={{fontWeight:700,fontSize:17}}>📰 가짜뉴스 유포</span>
              <button onClick={()=>setShowFake(false)} style={{...BTN_WHITE,padding:"4px 12px",fontSize:13}}>✕</button>
            </div>
            <div style={{padding:"10px 14px",background:"#fefce8",border:"1px solid #fde68a",borderRadius:8,fontSize:12,color:"#92400e",marginBottom:14}}>⚠️ 이적시장 혼란 조성 · 시즌당 1회 사용 가능</div>
            {/* STEP 1: 선수 선택 */}
            <div style={{marginBottom:14}}>
              <div style={{fontSize:13,fontWeight:700,marginBottom:8}}>① 대상 선수 선택</div>
              <div style={{maxHeight:160,overflowY:"auto",border:`1px solid ${C.border}`,borderRadius:8}}>
                {squad.concat(ALL_PLAYERS.filter(p=>p.club!==selTeam?.id).slice(0,30)).slice(0,40).map(p=>(
                  <div key={p.id} onClick={()=>setFakePlayer(p)} style={{padding:"8px 12px",cursor:"pointer",background:fakePlayer?.id===p.id?"#eff6ff":"transparent",borderBottom:"1px solid #f1f5f9",display:"flex",alignItems:"center",gap:10}}>
                    <div style={{width:30,height:30,borderRadius:"50%",background:fakePlayer?.id===p.id?"#2563eb":"#e2e8f0",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,color:fakePlayer?.id===p.id?"#fff":"#555",flexShrink:0}}>{p.rat}</div>
                    <div>
                      <div style={{fontSize:13,fontWeight:600,color:C.text}}>{p.name}</div>
                      <div style={{fontSize:11,color:C.textSm}}>{p.pos} · {p.nat} · {fmt(getMarketVal(p))}</div>
                    </div>
                    {fakePlayer?.id===p.id&&<span style={{marginLeft:"auto",color:"#2563eb",fontSize:18}}>✓</span>}
                  </div>
                ))}
              </div>
            </div>
            {/* STEP 2: 루머 유형 선택 */}
            <div style={{marginBottom:14}}>
              <div style={{fontSize:13,fontWeight:700,marginBottom:8}}>② 루머 유형 선택</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                {FAKE_TEMPLATES.map(tmpl=>(
                  <div key={tmpl.id} onClick={()=>setFakeTemplate(tmpl)} style={{padding:"10px 12px",borderRadius:8,border:`1.5px solid ${fakeTemplate?.id===tmpl.id?"#2563eb":"#e2e8f0"}`,background:fakeTemplate?.id===tmpl.id?"#eff6ff":"#fff",cursor:"pointer"}}>
                    <div style={{fontSize:13,fontWeight:600,color:C.text}}>{tmpl.label}</div>
                  </div>
                ))}
              </div>
            </div>
            {/* 미리보기 */}
            {fakePlayer&&fakeTemplate&&(
              <div style={{marginBottom:14,padding:"10px 12px",background:C.bg,border:`1px solid ${C.border}`,borderRadius:8}}>
                <div style={{fontSize:11,color:C.textSm,marginBottom:4}}>📋 기사 미리보기</div>
                <div style={{fontSize:12,color:C.text,fontWeight:500,lineHeight:1.5}}>{fakeTemplate.fn(fakePlayer,[selTeam,...ALL_TEAMS.filter(t=>t.id!==selTeam.id).sort(()=>Math.random()-0.5).slice(0,2)])}</div>
              </div>
            )}
            <div style={{display:"flex",gap:10}}>
              <button onClick={publishFake} style={{...BTN_PRIMARY,flex:1,padding:"11px",fontSize:14,opacity:(fakePlayer&&fakeTemplate)?1:0.45,cursor:(fakePlayer&&fakeTemplate)?"pointer":"not-allowed"}}>🗞️ 기사 송고</button>
              <button onClick={()=>setShowFake(false)} style={{...BTN_CANCEL,padding:"11px 18px",fontSize:13}}>취소</button>
            </div>
          </div>
        </div>
      )}
      {/* ══ 선발 명단 설정 모달 (포메이션 스쿼드 메이커) ══ */}
      {showLineup&&(()=>{
        const slots=customFormationSlots||FORMATIONS[formation];
        const filledCount=slots.filter((_,i)=>lineupSlots[i]&&squad.find(s=>s.id===lineupSlots[i])&&!injured.includes(lineupSlots[i])).length;
        const gkSlot=lineupSlots[0];
        const gkPlayer=squad.find(p=>p.id===gkSlot);
        const hasGK=gkPlayer&&gkPlayer.pos==="GK"&&!injured.includes(gkPlayer.id);
        return(
        <div style={MODAL_OVERLAY}>
          <div style={{...MODAL_BOX,maxWidth:680}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
              <span style={{fontWeight:700,fontSize:17}}>📋 포메이션 / 선발 명단 설정</span>
              <button onClick={()=>{setShowLineup(false);setEditSlot(null);setCustomFormationMode(false);setCustomFormationSlots(null);}} style={{...BTN_WHITE,padding:"4px 12px",fontSize:13}}>✕</button>
            </div>
            {/* 포메이션 선택 탭 */}
            <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:8,borderBottom:"1px solid #e2e8f0",paddingBottom:8}}>
              {FORMATION_NAMES.map(fk=>(
                <button key={fk} onClick={()=>{
                  setFormation(fk);
                  setLineupSlots(autoAssignFormation(fk,squad,injured,playerConditions));
                  setEditSlot(null);
                  setCustomFormationMode(false);
                  setCustomFormationSlots(null);
                }} style={{padding:"5px 14px",fontSize:12,borderRadius:20,border:formation===fk&&!customFormationMode?"2px solid #2563eb":"1px solid #d1d5db",background:formation===fk&&!customFormationMode?"#eff6ff":"#fff",color:formation===fk&&!customFormationMode?"#2563eb":"#555",cursor:"pointer",fontWeight:formation===fk&&!customFormationMode?700:400}}>{fk}</button>
              ))}
              <button onClick={()=>{
                setCustomFormationMode(v=>!v);
                if(!customFormationMode) setCustomFormationSlots([...FORMATIONS[formation]]);
                else setCustomFormationSlots(null);
              }} style={{padding:"5px 14px",fontSize:12,borderRadius:20,border:customFormationMode?"2px solid #7c3aed":"1px solid #d1d5db",background:customFormationMode?"#f5f3ff":"#fff",color:customFormationMode?"#7c3aed":"#555",cursor:"pointer",fontWeight:customFormationMode?700:400}}>🔧 자유 편집</button>
            </div>
            {/* 자유 편집 모드 안내 */}
            {customFormationMode&&(
              <div style={{padding:"8px 12px",background:"#f5f3ff",border:"1px solid #c4b5fd",borderRadius:8,marginBottom:8,fontSize:12,color:"#7c3aed"}}>
                🔧 <strong>자유 편집 모드</strong> — 드래그로 위치 이동 · 클릭하면 선수 배치 + <strong>슬롯 포지션 변경</strong> 가능
              </div>
            )}
            <div style={{fontSize:12,color:hasGK?"#16a34a":"#dc2626",marginBottom:8,fontWeight:600}}>
              {hasGK?`✅ 골키퍼 배치됨 · 선발 ${filledCount}/11명`:"⚠️ 골키퍼(GK)를 반드시 1명 배치해야 합니다!"}
            </div>
            {/* 피치 뷰 — 자유 편집 시 드래그 가능 */}
            <div
              id="pitch-container"
              style={{position:"relative",width:"100%",aspectRatio:"100/110",background:"linear-gradient(180deg,#166534,#15803d,#166534)",borderRadius:12,marginBottom:12,border:"3px solid #14532d",overflow:"hidden",userSelect:"none"}}
              onDragOver={e=>e.preventDefault()}
              onDrop={customFormationMode?e=>{
                e.preventDefault();
                const slotIdx=parseInt(e.dataTransfer.getData("slotIdx"));
                if(isNaN(slotIdx))return;
                const rect=e.currentTarget.getBoundingClientRect();
                const x=Math.round(((e.clientX-rect.left)/rect.width)*100);
                const y=Math.round(((e.clientY-rect.top)/rect.height)*100);
                const updated=[...(customFormationSlots||FORMATIONS[formation])];
                updated[slotIdx]={...updated[slotIdx],x:Math.max(5,Math.min(95,x)),y:Math.max(5,Math.min(95,y))};
                setCustomFormationSlots(updated);
                setEditSlot(null);
              }:undefined}
            >
              {/* 피치 라인 */}
              <div style={{position:"absolute",left:"5%",right:"5%",top:"3%",bottom:"3%",border:"1.5px solid rgba(255,255,255,0.3)",borderRadius:4}}/>
              <div style={{position:"absolute",left:"10%",right:"10%",top:"50%",height:"1.5px",background:"rgba(255,255,255,0.3)"}}/>
              <div style={{position:"absolute",left:"50%",top:"50%",width:60,height:60,marginLeft:-30,marginTop:-30,border:"1.5px solid rgba(255,255,255,0.3)",borderRadius:"50%"}}/>
              <div style={{position:"absolute",left:"25%",right:"25%",top:"3%",height:"18%",border:"1.5px solid rgba(255,255,255,0.2)",borderTop:"none"}}/>
              <div style={{position:"absolute",left:"25%",right:"25%",bottom:"3%",height:"18%",border:"1.5px solid rgba(255,255,255,0.2)",borderBottom:"none"}}/>
              {slots.map((slot,i)=>{
                const pid=lineupSlots[i];
                const p=pid?squad.find(s=>s.id===pid):null;
                const isInj=p&&injured.includes(p.id);
                const isGKslot=i===0;
                const empty=!p||isInj;
                const cond=p?playerConditions[p.id]:null;
                const condColor=cond===null||cond===undefined?"#888":cond>=70?"#4ade80":cond>=50?"#fbbf24":"#f87171";
                return(
                  <div
                    key={i}
                    draggable={customFormationMode}
                    onDragStart={customFormationMode?e=>{e.dataTransfer.setData("slotIdx",String(i));}:undefined}
                    onClick={()=>setEditSlot(editSlot===i?null:i)}
                    style={{position:"absolute",left:`${slot.x}%`,top:`${slot.y}%`,transform:"translate(-50%,-50%)",cursor:customFormationMode?"grab":"pointer",textAlign:"center",zIndex:editSlot===i?10:2}}
                  >
                    {/* 컨디션 링 */}
                    <div style={{width:isGKslot?48:42,height:isGKslot?48:42,borderRadius:"50%",background:empty?"rgba(255,255,255,0.18)":isGKslot?"#fbbf24":"#fff",border:editSlot===i?"3px solid #a78bfa":empty?"2px dashed rgba(255,255,255,0.7)":`3px solid ${condColor}`,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:13,color:empty?"#fff":"#111",boxShadow:editSlot===i?"0 0 0 3px rgba(167,139,250,0.4)":"0 2px 8px rgba(0,0,0,0.3)"}}>
                      {empty?(isGKslot?"GK":"+"):p.rat}
                    </div>
                    <div style={{fontSize:9,color:"#fff",marginTop:2,maxWidth:64,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",textShadow:"0 1px 3px rgba(0,0,0,0.8)",fontWeight:600}}>
                      {p?(p.name.length>6?p.name.slice(0,5)+"…":p.name):slot.pos}{isInj?" 🩹":""}
                    </div>
                    {/* 컨디션 수치 */}
                    {p&&!isInj&&cond!==undefined&&(
                      <div style={{fontSize:8,color:condColor,fontWeight:700,textShadow:"0 1px 2px rgba(0,0,0,0.8)"}}>{cond}%</div>
                    )}
                    {/* 편집 중 표시 */}
                    {customFormationMode&&<div style={{position:"absolute",top:-6,right:-6,width:12,height:12,background:"#7c3aed",borderRadius:"50%",border:"1px solid #fff",display:"flex",alignItems:"center",justifyContent:"center"}}><span style={{color:"#fff",fontSize:8}}>↕</span></div>}
                  </div>
                );
              })}
            </div>
            {/* 선수 선택 패널 */}
            {editSlot!==null&&(()=>{
              const slot=slots[editSlot];
              const ALL_POS=["GK","CB","LB","RB","CDM","CM","CAM","LW","RW","ST","CF","LM","RM","LWB","RWB"];
              const candidates=squad.filter(p=>!injured.includes(p.id)).sort((a,b)=>{
                const aCompat=slot.compat.includes(a.pos)?slot.compat.indexOf(a.pos):99;
                const bCompat=slot.compat.includes(b.pos)?slot.compat.indexOf(b.pos):99;
                if(aCompat!==bCompat)return aCompat-bCompat;
                return b.rat-a.rat;
              });
              return(
                <div style={{marginBottom:12,padding:"10px",background:C.bg,border:`1px solid ${C.border}`,borderRadius:10}}>
                  <div style={{fontSize:12,fontWeight:700,marginBottom:6,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <span>{slot.pos} 슬롯 선수 선택 {slot.pos==="GK"&&<span style={{color:C.danger}}>(필수)</span>}</span>
                    {customFormationMode&&<span style={{fontSize:11,color:"#7c3aed",fontWeight:400}}>🔧 슬롯 포지션 변경 가능</span>}
                  </div>
                  {/* 자유 편집 모드: 슬롯 포지션 변경 UI */}
                  {customFormationMode&&(
                    <div style={{marginBottom:10,padding:"8px 10px",background:"#f5f3ff",border:"1px solid #c4b5fd",borderRadius:8}}>
                      <div style={{fontSize:11,fontWeight:700,color:"#7c3aed",marginBottom:6}}>🔧 슬롯 포지션 변경</div>
                      {/* 슬롯 레이블(pos) 변경 */}
                      <div style={{marginBottom:6}}>
                        <div style={{fontSize:10,color:C.textSm,marginBottom:4}}>슬롯 레이블 (피치에 표시)</div>
                        <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
                          {ALL_POS.map(p=>(
                            <button key={p} onClick={()=>{
                              const updated=[...slots];
                              updated[editSlot]={...updated[editSlot],pos:p};
                              setCustomFormationSlots(updated);
                            }} style={{padding:"3px 8px",fontSize:10,borderRadius:6,border:`1.5px solid ${slot.pos===p?"#7c3aed":"#d1d5db"}`,background:slot.pos===p?"#7c3aed":"#fff",color:slot.pos===p?"#fff":"#555",cursor:"pointer",fontWeight:slot.pos===p?700:400}}>{p}</button>
                          ))}
                        </div>
                      </div>
                      {/* compat 포지션 토글 */}
                      <div>
                        <div style={{fontSize:10,color:C.textSm,marginBottom:4}}>호환 포지션 (복수 선택 가능)</div>
                        <div style={{display:"flex",flexWrap:"wrap",gap:4}}>
                          {ALL_POS.map(p=>{
                            const isOn=slot.compat.includes(p);
                            return(
                              <button key={p} onClick={()=>{
                                const newCompat=isOn
                                  ?slot.compat.filter(c=>c!==p)
                                  :[...slot.compat,p];
                                if(newCompat.length===0)return; // 최소 1개
                                const updated=[...slots];
                                updated[editSlot]={...updated[editSlot],compat:newCompat};
                                setCustomFormationSlots(updated);
                              }} style={{padding:"3px 8px",fontSize:10,borderRadius:6,border:`1.5px solid ${isOn?"#2563eb":"#d1d5db"}`,background:isOn?"#2563eb":"#fff",color:isOn?"#fff":"#555",cursor:"pointer",fontWeight:isOn?700:400}}>{p}</button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                  <div style={{maxHeight:180,overflowY:"auto",display:"grid",gridTemplateColumns:"1fr 1fr",gap:4}}>
                    {candidates.map(p=>{
                      const isCompat=slot.compat.includes(p.pos);
                      const assignedSlot=Object.entries(lineupSlots).find(([k,v])=>v===p.id&&Number(k)!==editSlot);
                      const cond=playerConditions[p.id]??80;
                      return(
                        <div key={p.id} onClick={()=>{
                          setLineupSlots(prev=>{
                            const next={...prev};
                            Object.keys(next).forEach(k=>{if(next[k]===p.id)delete next[k];});
                            next[editSlot]=p.id;
                            return next;
                          });
                          setEditSlot(null);
                        }} style={{padding:"6px 10px",borderRadius:8,border:`1.5px solid ${isCompat?"#bfdbfe":"#e2e8f0"}`,background:isCompat?"#eff6ff":"#fff",cursor:"pointer",display:"flex",alignItems:"center",gap:6,fontSize:12}}>
                          <div style={{width:28,height:28,borderRadius:"50%",background:getPlayerAvatar(p.pos),display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:11,color:"#fff",flexShrink:0}}>{p.rat}</div>
                          <div style={{flex:1,minWidth:0}}>
                            <div style={{fontWeight:600,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.name}</div>
                            <div style={{fontSize:10,color:C.textSm}}>{p.pos} · {p.age}세 · <span style={{fontWeight:700,color:getPotI(p).color}}>{getPotI(p).label}</span></div>
                          </div>
                          <div style={{textAlign:"right",flexShrink:0}}>
                            <div style={{fontSize:10,fontWeight:700,color:cond>=70?"#16a34a":cond>=50?"#d97706":"#dc2626"}}>{cond}%</div>
                            {assignedSlot&&<span style={{fontSize:9,color:C.warn}}>(교체)</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div style={{display:"flex",gap:8,marginTop:8}}>
                    {lineupSlots[editSlot]&&<button onClick={()=>{
                      setLineupSlots(prev=>{const next={...prev};delete next[editSlot];return next;});
                    }} style={{...BTN_CANCEL,padding:"6px 12px",fontSize:12}}>슬롯 비우기</button>}
                    <button onClick={()=>setEditSlot(null)} style={{...BTN_WHITE,padding:"6px 12px",fontSize:12}}>닫기</button>
                  </div>
                </div>
              );
            })()}
            <div style={{display:"flex",gap:10,marginTop:4}}>
              <button onClick={()=>{
                setLineupSlots(autoAssignFormation(formation,squad,injured,playerConditions));
                notify("최강 라인업으로 자동 배치됨","success");
              }} style={{...BTN_SUCCESS,flex:1,padding:"10px",fontSize:13}}>⚡ 자동 배치</button>
              <button onClick={()=>{
                if(!hasGK){notify("골키퍼를 선발 명단에 반드시 포함해야 합니다!","error");return;}
                const injuredInLineup=Object.values(lineupSlots).filter(pid=>injured.includes(pid));
                if(injuredInLineup.length>0){
                  const names=injuredInLineup.map(pid=>squad.find(p=>p.id===pid)?.name||pid).join(", ");
                  notify(`부상 선수(${names})는 선발 명단에 포함할 수 없습니다!`,"error");
                  return;
                }
                setShowLineup(false);setEditSlot(null);setCustomFormationMode(false);setCustomFormationSlots(null);
              }} style={{...BTN_PRIMARY,padding:"10px 18px",fontSize:13}}>✅ 확정</button>
            </div>
          </div>
        </div>
        );
      })()}
    </div>
  );
}
