/** Regras internas de triagem Concierge, não limites oficiais de fabricante.
 * A recomendação deve ser validada com portas, VPN, sessões, licenças e SE.
 */
export interface FirewallSpec { vendor: 'SonicWall' | 'Fortinet'; model: string; users: number; threatMbps: number }
export const FIREWALL_MATRIX: FirewallSpec[] = [
  ['SonicWall','TZ80',75,750],['SonicWall','TZ280',100,1000],['SonicWall','TZ370',100,1000],
  ['SonicWall','TZ380',150,1500],['SonicWall','TZ470',150,1500],['SonicWall','TZ480',200,2000],
  ['SonicWall','TZ570',200,2000],['SonicWall','TZ580',220,2200],['SonicWall','TZ670',250,2500],
  ['SonicWall','TZ680',250,2500],['SonicWall','NSA 2700',500,3000],['SonicWall','NSA 2800',600,6000],
  ['SonicWall','NSA 3700',550,3500],['SonicWall','NSA 3800',800,6000],
  ['Fortinet','40F',60,600],['Fortinet','50G',120,1100],['Fortinet','90G',200,2200],
  ['Fortinet','120G',250,2800],['Fortinet','200F',300,3000],['Fortinet','200G',500,6000],
  ['Fortinet','600F',700,10500],
].map(([vendor,model,users,threatMbps]) => ({vendor: vendor as FirewallSpec['vendor'],model: String(model), users: Number(users), threatMbps: Number(threatMbps)}));

export interface SizingInput {
 users?: number; links?: {speed?:string; provider?:string; increaseSpeed?:boolean; increaseSpeedNote?:string}[];
 usage?: string; measuredPeakMbps?: number; sslVpnUsers?:number; ipsecTunnels?:number;
 vlanCount?:number; apCount?:number; growthUsers?:number; needsHA?:boolean;
}
export interface SizingPick { primary: FirewallSpec | null; alternative: FirewallSpec | null; fits: boolean; reason:string }
export interface SizingResult {
 contractedMbps:number; peakMbps:number|null; peakSource:'medido'|'estimado'|'indisponível';
 estimatedUsers:number; readiness:'insuficiente'|'preliminar'|'revisão técnica';
 sonicwall:SizingPick; fortinet:SizingPick; checks:string[]; rationale:string[];
}
export function parseBandwidth(speed: string): number {
 const s=String(speed||'').toLowerCase().replace(',','.').trim();
 const m=s.match(/(\d+(?:\.\d+)?)/); if(!m) return 0;
 const v=Number(m[1]); if(!Number.isFinite(v)||v<=0)return 0;
 if(/(?:gbps|gb|gbit|gb\/s|g)(?:\b|$)/.test(s))return v*1000;
 if(/\b(?:kbps|kbit)\b/.test(s))return v/1000;
 return v; // default Mbps
}
export function recommendFirewall(input:SizingInput):SizingResult {
 const users=Math.max(0,Number(input.users)||0);
 const links=(input.links||[]).filter(l=>l.speed||l.provider);
 const speeds=links.map(l=>parseBandwidth(l.speed||''));
 const contractedMbps=speeds.reduce((sum,v)=>sum+v,0);
 const measuredPeak=Math.max(0,Number(input.measuredPeakMbps)||0);
 // Só pode estimar perfil de tráfego se houver dados mínimos. Fatores são hipóteses internas editáveis futuramente.
 const factors:Record<string,number>={low:.30,medium:.50,high:.75,baixo:.30,leve:.30,medio:.50,'médio':.50,alto:.75};
 const factor=factors[(input.usage||'').toLowerCase()];
 const peakSource=measuredPeak>0?'medido':contractedMbps>0&&factor?'estimado':'indisponível';
 const peakMbps=measuredPeak>0?measuredPeak:contractedMbps>0&&factor?contractedMbps*factor:null;
 const growth=Math.max(0,Number(input.growthUsers)||0);
 const estimatedUsers=Math.max(users,growth);
 const checks:string[]=[];
 if(!users)checks.push('Quantidade de usuários não informada');
 if(!links.length||!contractedMbps)checks.push('Velocidade dos links não confirmada');
 if(!input.usage&& !measuredPeak)checks.push('Perfil de uso ou pico medido ausente');
 if(peakSource==='estimado')checks.push('Pico de tráfego estimado: confirmar com medição real');
 if(links.some(l=>l.increaseSpeed))checks.push('Confirmar nova velocidade e horizonte de expansão dos links');
 if(input.needsHA)checks.push('Validar arquitetura HA e disponibilidade exigida');
 if((input.ipsecTunnels||0)>0)checks.push('Validar throughput VPN e comunicação entre unidades');
 if((input.sslVpnUsers||0)>0)checks.push('Validar licenciamento, simultaneidade e acesso remoto');
 if((input.vlanCount||0)>3)checks.push('Validar VLANs, políticas inter-redes e interfaces');
 if((input.apCount||0)>4)checks.push('Validar quantidade de APs e escopo de rede');
 if(contractedMbps>1000)checks.push('Validar interfaces físicas, roteamento e agregação de links');
 if(contractedMbps>=5000&&!measuredPeak)checks.push('Banda contratada muito elevada sem pico real: validar com pré-vendas');
 const hasBase=users>0&&peakMbps!==null;
 const readiness= !hasBase?'insuficiente':contractedMbps>=5000&&!measuredPeak?'revisão técnica':'preliminar';
 const requiredThroughput=(peakMbps||0)*1.2; // 20% de margem sobre o pico, não sobre a soma de links
 const pick=(vendor:FirewallSpec['vendor']):SizingPick=>{
  if(!hasBase)return {primary:null,alternative:null,fits:false,reason:'Informe usuários e perfil de tráfego ou pico medido'};
  if(readiness==='revisão técnica')return {primary:null,alternative:null,fits:false,reason:'Sem pico medido, a largura de banda informada exige revisão técnica'};
  const candidates=FIREWALL_MATRIX.filter(m=>m.vendor===vendor).sort((a,b)=>a.users-b.users||a.threatMbps-b.threatMbps);
  // Menor plataforma que atende os dois limites; não ordenar por percentual de ociosidade.
  const fits=candidates.filter(m=>m.users>=estimatedUsers&&m.threatMbps>=requiredThroughput);
  if(!fits.length)return {primary:null,alternative:null,fits:false,reason:'Necessidade acima da matriz ou dados insuficientes para fechar o sizing'};
  const primary=fits[0];
  const alternative=fits.find(m=>m.model!==primary.model&&(m.users>primary.users||m.threatMbps>primary.threatMbps))||null;
  return {primary,alternative,fits:true,reason:`${estimatedUsers} usuários e pico de ${Math.round(peakMbps||0)} Mbps com 20% de margem`};
 };
 return {contractedMbps,peakMbps,peakSource,estimatedUsers,readiness,sonicwall:pick('SonicWall'),fortinet:pick('Fortinet'),checks,rationale:[
   `${estimatedUsers||'Não informado'} usuários considerados`,
   `${contractedMbps||'Não informado'} Mbps contratados`,
   peakMbps===null?'Tráfego efetivo a confirmar':`${Math.round(peakMbps)} Mbps de pico ${peakSource==='medido'?'medido':'estimado pelo perfil de uso'}`,
   'Sem penalização por DPI SSL: não faz parte do serviço padrão',
 ]};
}
