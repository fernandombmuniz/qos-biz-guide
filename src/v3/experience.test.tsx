import {describe,it,expect,afterEach,beforeEach,vi} from 'vitest';
import {render,screen,fireEvent,cleanup,within} from '@testing-library/react';
import {defaultProfile,ProfileProvider} from '../context/ProfileContext';
import {analyze} from './model';
import {grade,meetingRoute,chapterRoute,nextChapter} from './experience';
import GuidedSimulation from './GuidedSimulation';
import V3App from './V3App';

afterEach(cleanup);
describe('Percurso e indicador V3.1',()=>{
 it('não exibe nota com respostas insuficientes ou todas desconhecidas',()=>{
  expect(grade(analyze(defaultProfile,{})).score).toBe(null);
  expect(grade(analyze(defaultProfile,{protection:'edr'})).score).toBe(null);
 });
 it('exclui NA, mantém cobertura independente e não dá zero para desconhecidos',()=>{
  const findings=analyze(defaultProfile,{backup:'yes',tested:'no',isolated:'na',backupOps:'yes'}).filter(x=>x.module==='backup');
  expect(grade(findings)).toEqual({total:4,answered:3,confirmed:2,coverage:75,score:67});
 });
 it('respeita objetivo, seleção manual e ordem, rejeitando módulos inválidos',()=>{
  expect(meetingRoute({goal:'Disponibilidade'})).toEqual(['firewall','backup']);
  expect(meetingRoute({goal:'Disponibilidade',meetingModules:'backup,invalid,endpoint,backup'})).toEqual(['backup','endpoint']);
 });
 it('pula capítulos opcionais e retorna ao percurso depois de aprofundamento',()=>{
  const route=chapterRoute({includeSimulation:'no'});
  expect(route).toEqual([0,1,5]);
  expect(nextChapter(1,route,1)).toBe(5);
  expect(nextChapter(3,route,1)).toBe(5);
  expect(nextChapter(3,route,-1)).toBe(1);
  expect(nextChapter(5,route,1)).toBe(5);
 });
});
describe('Simulações guiadas',()=>{
 const click=(name:RegExp)=>fireEvent.click(screen.getByRole('button',{name}));
 it('firewall percorre bloqueio, evento e investigação sem alterar fatos',()=>{
  const facts={firewall:'none'};
  render(<GuidedSimulation module="firewall" profile={defaultProfile} facts={facts}/>);
  click(/Abrir portal/);click(/Simular conexão/);click(/Aplicar política/);click(/Abrir evento/);click(/Acionar investigação/);
  expect(screen.getByText(/A equipe aciona a investigação/)).toBeInTheDocument();
  expect(facts).toEqual({firewall:'none'});
  click(/Reiniciar/);
  expect(screen.getByRole('button',{name:/Abrir portal/})).toBeEnabled();
 });
 it('endpoint separa download de execução e permite comparar intervenção',()=>{
  render(<GuidedSimulation module="endpoint" profile={defaultProfile} facts={{}}/>);
  click(/Abrir e-mail/);click(/Baixar anexo/);
  expect(screen.getByText(/O arquivo foi baixado, sem execução/)).toBeInTheDocument();
  click(/Abrir arquivo/);click(/Observar alteração/);click(/Abrir aviso/);
  expect(screen.getByText(/SIMULAÇÃO DE RESGATE:/)).toBeInTheDocument();
  click(/Comparar com intervenção/);click(/Abrir arquivo/);click(/Ver bloqueio/);click(/Isolar estação/);
  expect(screen.getByText('Estação isolada para investigação')).toBeInTheDocument();
 });
 it('backup bloqueia cópia falha e exige integridade e destino antes da restauração',()=>{
  render(<GuidedSimulation module="backup" profile={defaultProfile} facts={{backup:'no'}}/>);
  click(/Abrir sistema/);click(/Abrir pontos/);
  expect(screen.getByRole('button',{name:/09h de hoje/})).toBeDisabled();
  click(/08h de hoje/);
  expect(screen.getByRole('button',{name:/Restaurar serviço/})).toBeDisabled();
  fireEvent.click(screen.getByLabelText(/Integridade da cópia/));
  expect(screen.getByRole('button',{name:/Restaurar serviço/})).toBeDisabled();
  fireEvent.click(screen.getByLabelText(/Destino disponível/));
  click(/Restaurar serviço/);click(/Abrir aplicação/);
  expect(screen.getByText(/Ponto utilizado: 08h de hoje/)).toBeInTheDocument();
 });
});
describe('Reunião: isolamento da interface e encerramento',()=>{
 beforeEach(()=>{localStorage.clear();vi.spyOn(window,'scrollTo').mockImplementation(()=>{});});
 afterEach(()=>vi.restoreAllMocks());
 it('separa institucional, qualificação interna e apresentação da frente escolhida',()=>{
  localStorage.setItem('concierge-v3-facts',JSON.stringify({meetingModules:'endpoint',includeSimulation:'no',presenterNotes:'NOTA PRIVADA'}));
  render(<ProfileProvider><V3App/></ProfileProvider>);
  fireEvent.click(screen.getByRole('button',{name:'Apresentação institucional'}));
  expect(screen.queryByRole('button',{name:'Importar sessão'})).not.toBeInTheDocument();
  expect(screen.queryByRole('button',{name:'Sessões salvas'})).not.toBeInTheDocument();
  expect(screen.queryByText('NOTA PRIVADA')).not.toBeInTheDocument();
  for(let i=0;i<5;i++)fireEvent.click(screen.getByRole('button',{name:'Continuar'}));
  fireEvent.click(screen.getByRole('button',{name:/Finalizar apresentação/}));
  fireEvent.click(screen.getByRole('button',{name:'Endpoint'}));
  expect(screen.getByRole('heading',{name:'Dimensionamento de Endpoint'})).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button',{name:/Gerar apresentação de Endpoint/}));
  fireEvent.click(screen.getByRole('button',{name:'Continuar'}));
  expect(screen.getByRole('heading',{name:'O que merece atenção'})).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button',{name:'Continuar'}));
  expect(screen.getByRole('heading',{name:'Próximos passos'})).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button',{name:'Concluir reunião'}));
  expect(screen.getByRole('heading',{name:'O que combinamos.'})).toBeInTheDocument();
  expect(screen.getAllByRole('heading',{level:3}).map(x=>x.textContent)).toEqual(['Endpoint']);
 });
});
