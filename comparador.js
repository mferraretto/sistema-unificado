  function mostrarAba(id) {
      document.querySelectorAll('.aba').forEach(a => a.classList.remove('ativa'));
document.getElementById(id).classList.add('ativa');
    }

    function ajustarTransacaoML() {
      const taxa = document.getElementById('mlTaxa').value;
      if (taxa === '11') {
        document.getElementById('mlTransacao').value = '1.85';
      }
    }
function ajustarTransacaoMG() {
  const taxa = document.getElementById('mgTaxa').value;
  // Você pode ajustar a transação se quiser condicionar com base na taxa
  if (taxa === '16') {
    document.getElementById('mgTransacao').value = '1.80';
  } else if (taxa === '10') {
    document.getElementById('mgTransacao').value = '1.60';
  } else {
    document.getElementById('mgTransacao').value = '0';
  }
}

function ajustarTransacaoSHN() {
  const taxa = document.getElementById('shnTaxa').value;
  // Shein não cobra transação extra, mas pode ser ajustado se mudar futuramente
  if (taxa === '16') {
    document.getElementById('shnTransacao').value = '0';
  } else {
    document.getElementById('shnTransacao').value = '0';
  }
}

 function calcularPrecoMinimo(plataforma) {
      const get = id => parseFloat(document.getElementById(id)?.value) || 0;
      const taxa = get(plataforma + 'Taxa');
      const transacao = get(plataforma + 'Transacao');
      const transferencia = get(plataforma + 'Transferencia');
      const antecipacao = get(plataforma + 'Antecipacao');
      const comissao = get(plataforma + 'Comissao');
      const imposto = get(plataforma + 'Imposto');
      const fixo = get(plataforma + 'Fixo');
      const frete = get(plataforma + 'Frete');
      const variavel = get(plataforma + 'Variavel');
      const custo = get('custoProduto');

      const t = (taxa + transacao + transferencia + antecipacao) / 100;
      const c = comissao / 100;
      const i = imposto / 100;
      const F = fixo + frete + variavel;
      const denominador = (1 - t) * (1 - c) - i;
      if (denominador === 0) return 0;
      const p = (F * (1 - c) + custo) / denominador;
      return p;
    }

    function atualizarPrecosMinimos() {
  const mlMin = calcularPrecoMinimo('ml');
  const shMin = calcularPrecoMinimo('sh');
  const mgMin = calcularPrecoMinimo('mg');
  const shnMin = calcularPrecoMinimo('shn');

  const mlField = document.getElementById('mlPrecoMinimo');
  const shField = document.getElementById('shPrecoMinimo');
  const mgField = document.getElementById('mgPrecoMinimo');
  const shnField = document.getElementById('shnPrecoMinimo');

  if (mlField) mlField.value = mlMin.toFixed(2);
  if (shField) shField.value = shMin.toFixed(2);
  if (mgField) mgField.value = mgMin.toFixed(2);
  if (shnField) shnField.value = shnMin.toFixed(2);
}

async function calcularERegistrar() {
  const get = id => parseFloat(document.getElementById(id)?.value) || 0;
  const produto = document.getElementById('produto').value;
  const precoManual = get('precoVenda');
  const custo = get('custoProduto');

  atualizarPrecosMinimos(); // Atualiza os preços antes de calcular

  const calc = plataforma => {
    const taxa = get(plataforma + 'Taxa');
    const fixo = get(plataforma + 'Fixo');
    const frete = get(plataforma + 'Frete');
    const transacao = get(plataforma + 'Transacao');
    const transferencia = get(plataforma + 'Transferencia');
    const antecipacao = get(plataforma + 'Antecipacao');
    const variavel = get(plataforma + 'Variavel');
    const imposto = get(plataforma + 'Imposto');
    const comissao = get(plataforma + 'Comissao');

    const preco = precoManual || calcularPrecoMinimo(plataforma);
    const taxaTotal = preco * ((taxa + transacao + transferencia + antecipacao) / 100);
    const sobra = preco - taxaTotal - fixo - frete - variavel;
    const comissaoValor = sobra * (comissao / 100);
    const impostoValor = preco * (imposto / 100);
    const lucro = sobra - comissaoValor - impostoValor - custo;
    const margem = (lucro / preco) * 100;

    const nomes = {
      ml: 'Mercado Livre',
      sh: 'Shopee',
      mg: 'Magalu',
      shn: 'Shein'
    };

    return {
      plataforma: nomes[plataforma] || plataforma.toUpperCase(),
      produto,
      preco: preco.toFixed(2),
      taxaTotal: taxaTotal.toFixed(2),
      fixo: fixo.toFixed(2),
      frete: frete.toFixed(2),
      transacao: transacao.toFixed(2),
      transferencia: transferencia.toFixed(2),
      antecipacao: antecipacao.toFixed(2),
      variavel: variavel.toFixed(2),
      sobra: sobra.toFixed(2),
      comissao: comissaoValor.toFixed(2),
      imposto: impostoValor.toFixed(2),
      custo: custo.toFixed(2),
      lucro: lucro.toFixed(2),
      margem: margem.toFixed(2)
    };
  };

  const ml = calc('ml');
  const sh = calc('sh');
  const mg = calc('mg');
  const shn = calc('shn');

  // Salvar localmente
  const registros = JSON.parse(localStorage.getItem('resultadosLucro')) || [];
  registros.push({ ml, sh, mg, shn, produto, precoManual, custo });
  localStorage.setItem('resultadosLucro', JSON.stringify(registros));

  // Salvar no Firebase
  try {
    await firebase.firestore().collection("resultadosLucro").add({
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      produto: produto,
      ml: ml,
      sh: sh,
      mg: mg,
      shn: shn
    });
    console.log("Cálculo salvo no Firebase com sucesso!");
  } catch (error) {
    console.error("Erro ao salvar no Firebase:", error);
  }

  // Atualizar tela
  desenharGraficoLucro(ml, sh, mg, shn);
  renderizarCards(registros);
  mostrarAba('resultados');
}

async function salvarCalculosNoFirebase(dados) {
  try {
    await addDoc(collection(db, "resultadosLucro"), {
      timestamp: serverTimestamp(),
      produto: dados.ml.produto,
      ml: dados.ml,
      sh: dados.sh,
      mg: dados.mg,
      shn: dados.shn
    });
    console.log("Cálculo salvo no Firebase com sucesso!");
  } catch (error) {
    console.error("Erro ao salvar no Firebase:", error);
  }
}

 async function carregarResultadosFirebase() {
  const container = document.getElementById('cardsResultados');
      try {
    const snapshot = await db
      .collection("resultadosLucro")
      .orderBy("timestamp", "desc")
      .get();

    const registros = [];
    snapshot.forEach(doc => {
      const data = doc.data();
   registros.push({
  produto: data.produto || 'Produto sem nome',
  precoManual: parseFloat(data.ml?.preco || 0),
  custoProduto: parseFloat(data.ml?.custo || 0),
  ml: data.ml || {},
  sh: data.sh || {},
  mg: data.mg || {},
  shn: data.shn || {},
  timestamp: data.timestamp?.toDate?.() || new Date()
});

    });
 // remove aviso de erro se houver
        const aviso = document.getElementById('firebaseErro');
        if (aviso) aviso.remove();
        container.dataset.firebaseErro = '';
    return registros;
  } catch (error) {
    console.error('❌ Erro ao carregar do Firebase:', error);
        if (!document.getElementById('firebaseErro')) {
          const msg = document.createElement('p');
          msg.id = 'firebaseErro';
          msg.textContent = '⚠️ Não foi possível carregar os resultados online.';
          msg.style.color = '#e74c3c';
          container.prepend(msg);
        }
        container.dataset.firebaseErro = 'true';
    return [];
  }
}

function normalizarRegistros(registros) {
  if (!Array.isArray(registros)) return [];

  return registros.map(r => {
    // Caso venha como array [ml, sh, mg, shn]
    if (Array.isArray(r)) {
      const [ml, sh, mg, shn] = r;
      return {
        ml: ml || {},
        sh: sh || {},
        mg: mg || {},
        shn: shn || {},
        produto: ml?.produto || sh?.produto || ''
      };
    }

    // Caso venha como objeto completo {ml, sh, mg, shn, produto}
    const { ml = {}, sh = {}, mg = {}, shn = {} } = r;
    return {
      ...r,
      ml,
      sh,
      mg,
      shn
    };
  });
}

function renderizarCards(registrosParam) {
  const registros = normalizarRegistros(registrosParam || JSON.parse(localStorage.getItem('resultadosLucro')) || []);
  window.registros = registros; // Garante acesso global para duplicar/apagar
  const container = document.getElementById('cardsResultados');
  container.innerHTML = '';
  
if (container.dataset.firebaseErro === 'true') {
    container.innerHTML = '<p id="firebaseErro" style="color:#e74c3c">⚠️ Não foi possível carregar os resultados online.</p>';
  }
  
 registros.forEach((registro, index) => {
    const { ml, sh, mg, shn, produto } = registro;
    const produtoNome = produto || ml?.produto || sh?.produto || mg?.produto || shn?.produto || 'Produto';

    const lucros = {
      ml: parseFloat(ml?.lucro || 0),
      sh: parseFloat(sh?.lucro || 0),
      mg: parseFloat(mg?.lucro || 0),
      shn: parseFloat(shn?.lucro || 0),
    };

    const maiorLucro = Math.max(...Object.values(lucros));

    const gerarSelo = (plataforma) =>
      lucros[plataforma] === maiorLucro && maiorLucro > 0
        ? ' <span style="background:#28a745; color:white; padding:2px 6px; border-radius:4px; font-size:11px;">⭐ Melhor opção</span>'
        : '';

    const gerarAlerta = (lucro) =>
      lucro < 0 ? '<span style="color:#e74c3c;">Lucro negativo — reveja frete, antecipação ou comissão.</span>' : '';

    const meta = parseFloat(localStorage.getItem('metaMargem')) || 0;

    const gerarMargem = (p) => {
      const margem = parseFloat(p?.margem || 0);
      const status =
        margem >= meta
          ? ' <span style="color:#28a745;">✔️ Atingiu</span>'
          : ' <span style="color:#e74c3c;">❌ Abaixo</span>';
      return `${p?.margem || '0'}%${status}`;
    };

    const formatPorcentagem = (valor) =>
      isNaN(parseFloat(valor)) ? '0%' : `${parseFloat(valor)}%`;

    const rows = [
      ['Preço', ml?.preco, sh?.preco, mg?.preco, shn?.preco],
      ['Taxas', ml?.taxaTotal, sh?.taxaTotal, mg?.taxaTotal, shn?.taxaTotal],
      ['Custo Fixo', ml?.fixo, sh?.fixo, mg?.fixo, shn?.fixo],
      ['Frete', ml?.frete, sh?.frete, mg?.frete, shn?.frete],
      ['Antecipação',
        formatPorcentagem(ml?.antecipacao),
        formatPorcentagem(sh?.antecipacao),
        formatPorcentagem(mg?.antecipacao),
        formatPorcentagem(shn?.antecipacao)],
      ['Transferência',
        formatPorcentagem(ml?.transferencia),
        formatPorcentagem(sh?.transferencia),
        formatPorcentagem(mg?.transferencia),
        formatPorcentagem(shn?.transferencia)],
      ['Custos Variáveis', ml?.variavel, sh?.variavel, mg?.variavel, shn?.variavel],
      ['Sobra', ml?.sobra, sh?.sobra, mg?.sobra, shn?.sobra],
      ['Comissão', ml?.comissao, sh?.comissao, mg?.comissao, shn?.comissao],
      ['Imposto', ml?.imposto, sh?.imposto, mg?.imposto, shn?.imposto],
      ['Custo Produto', ml?.custo, sh?.custo, mg?.custo, shn?.custo],
      ['Lucro Final',
        `<strong style="color:${lucros.ml >= 0 ? '#28a745' : '#cc0000'}">R$${ml?.lucro}</strong>${gerarSelo('ml')}`,
        `<strong style="color:${lucros.sh >= 0 ? '#28a745' : '#cc0000'}">R$${sh?.lucro}</strong>${gerarSelo('sh')}`,
        `<strong style="color:${lucros.mg >= 0 ? '#28a745' : '#cc0000'}">R$${mg?.lucro}</strong>${gerarSelo('mg')}`,
        `<strong style="color:${lucros.shn >= 0 ? '#28a745' : '#cc0000'}">R$${shn?.lucro}</strong>${gerarSelo('shn')}`
      ],
      ...(Object.values(lucros).some(l => l < 0)
        ? [['⚠️ Alerta',
            gerarAlerta(lucros.ml),
            gerarAlerta(lucros.sh),
            gerarAlerta(lucros.mg),
            gerarAlerta(lucros.shn)]]
        : []),
      ['Margem',
        gerarMargem(ml),
        gerarMargem(sh),
        gerarMargem(mg),
        gerarMargem(shn)
      ]
    ];

    container.innerHTML += `
      <div class="fade-card" style="position: relative; overflow-x: auto; margin-bottom: 40px;">
        <div style="position: absolute; top: 10px; right: 10px; display: flex; gap: 10px;">
          <button onclick="duplicarRegistro(${index})"
            style="background: #3498db; color: white; border: none; padding: 6px 10px;
                  border-radius: 4px; cursor: pointer; font-size: 13px;">
            📋 Duplicar
          </button>
          <button onclick="apagarRegistro(${index})"
            style="background: #e74c3c; color: white; border: none; padding: 6px 10px;
                  border-radius: 4px; cursor: pointer; font-size: 13px;">
            🗑 Apagar
          </button>
        </div>

        <table style="width: auto; margin: auto; border-collapse: collapse; font-family: 'Segoe UI', sans-serif; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
          <thead>
            <tr style="background-color: #ffffff;">
              <th colspan="5" style="text-align: center; padding: 16px; font-size: 18px; font-weight: 600; color: #333; border-bottom: 2px solid #ccc;">
                ${produtoNome}
              </th>
            </tr>
            <tr style="background-color: #f3f4f6;">
              <th style="padding: 10px 16px;"></th>
              <th style="padding: 10px 16px;">Mercado Livre</th>
              <th style="padding: 10px 16px;">Shopee</th>
              <th style="padding: 10px 16px;">Magalu</th>
              <th style="padding: 10px 16px;">Shein</th>
            </tr>
          </thead>
          <tbody>
            ${rows.map(([label, v1, v2, v3, v4], i) => `
              <tr style="background-color: ${i % 2 === 0 ? '#ffffff' : '#f9fafb'};">
                <td style="padding: 8px 12px; text-align: right; font-weight: 500;">${label}</td>
                <td style="padding: 8px 12px; text-align: right;">${v1 || '-'}</td>
                <td style="padding: 8px 12px; text-align: right;">${v2 || '-'}</td>
                <td style="padding: 8px 12px; text-align: right;">${v3 || '-'}</td>
                <td style="padding: 8px 12px; text-align: right;">${v4 || '-'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  });
}

function apagarRegistro(index) {
  const registros = normalizarRegistros(JSON.parse(localStorage.getItem('resultadosLucro')) || []);
  registros.splice(index, 1); // Remove o item
  localStorage.setItem('resultadosLucro', JSON.stringify(registros));
  renderizarCards(registros); // Atualiza a tela
}
function duplicarRegistro(index) {
  const registros = normalizarRegistros(JSON.parse(localStorage.getItem('resultadosLucro')) || []);
  const copia = JSON.parse(JSON.stringify(registros[index])); // duplicação profunda
  registros.splice(index + 1, 0, copia); // insere logo abaixo
  localStorage.setItem('resultadosLucro', JSON.stringify(registros));
  renderizarCards(registros);
}

function calcularCustoVariavelShopee() {
  const total =
    (parseFloat(document.getElementById('cv_sh_funcionarios').value) || 0) +
    (parseFloat(document.getElementById('cv_sh_erp').value) || 0) +
    (parseFloat(document.getElementById('cv_sh_hubs').value) || 0) +
    (parseFloat(document.getElementById('cv_sh_automacao').value) || 0) +
    (parseFloat(document.getElementById('cv_sh_edicao').value) || 0) +
    (parseFloat(document.getElementById('cv_sh_imagens').value) || 0) +
    (parseFloat(document.getElementById('cv_sh_bancarios').value) || 0) +
    (parseFloat(document.getElementById('cv_sh_admin').value) || 0);

  const vendas = parseFloat(document.getElementById('cv_sh_vendas').value) || 1;
  const custoUnitario = (total / vendas).toFixed(2);

  document.getElementById('shVariavel').value = custoUnitario;
  document.getElementById('resultadoShopee').innerText = `Custo por unidade: R$${custoUnitario}`;
}

function calcularCustoVariavelML() {
  const total =
    (parseFloat(document.getElementById('cv_ml_funcionarios').value) || 0) +
    (parseFloat(document.getElementById('cv_ml_erp').value) || 0) +
    (parseFloat(document.getElementById('cv_ml_hubs').value) || 0) +
    (parseFloat(document.getElementById('cv_ml_automacao').value) || 0) +
    (parseFloat(document.getElementById('cv_ml_edicao').value) || 0) +
    (parseFloat(document.getElementById('cv_ml_imagens').value) || 0) +
    (parseFloat(document.getElementById('cv_ml_bancarios').value) || 0) +
    (parseFloat(document.getElementById('cv_ml_admin').value) || 0);

  const vendas = parseFloat(document.getElementById('cv_ml_vendas').value) || 1;
  const custoUnitario = (total / vendas).toFixed(2);

  document.getElementById('mlVariavel').value = custoUnitario;
  document.getElementById('resultadoML').innerText = `Custo por unidade: R$${custoUnitario}`;
}
function salvarCustosVariaveis() {
  const campos = document.querySelectorAll('#custos input');
  const dados = {};
  campos.forEach(input => {
    dados[input.id] = input.value;
  });
  localStorage.setItem('custosVariaveis', JSON.stringify(dados));
}
function carregarCustosVariaveis() {
  const dados = JSON.parse(localStorage.getItem('custosVariaveis')) || {};
  Object.keys(dados).forEach(id => {
    if (document.getElementById(id)) {
      document.getElementById(id).value = dados[id];
    }
  });
}
window.addEventListener('DOMContentLoaded', () => {
  carregarCustosVariaveis();
  document.querySelectorAll('#custos input').forEach(input => {
    input.addEventListener('input', salvarCustosVariaveis);
  });
  document.querySelectorAll('#formulario input, #formulario select').forEach(el => {
    el.addEventListener('input', atualizarPrecosMinimos);
    el.addEventListener('change', atualizarPrecosMinimos);
  });
  atualizarPrecosMinimos();
});

function alternarModoEscuro() {
  const corpo = document.body;
  corpo.classList.toggle('dark');

  const escuroAtivo = corpo.classList.contains('dark');
  localStorage.setItem('modoEscuro', escuroAtivo ? 'true' : 'false');

  document.getElementById('toggleDark').innerText = escuroAtivo ? '☀️' : '🌙';
}

window.addEventListener('DOMContentLoaded', () => {
  const ativo = localStorage.getItem('modoEscuro') === 'true';
  if (ativo) {
    document.body.classList.add('dark');
    document.getElementById('toggleDark').innerText = '☀️';
  }

  // já existente
  carregarCustosVariaveis();
  document.querySelectorAll('#custos input').forEach(input => {
    input.addEventListener('input', salvarCustosVariaveis);
  });
});
function exportarPDF() {
  const resultados = document.getElementById('cardsResultados');
  const opt = {
    margin: 0.5,
    filename: 'relatorio-lucros.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'cm', format: 'a4', orientation: 'portrait' }
  };
  html2pdf().set(opt).from(resultados).save();
}
function alternarModoApresentacao() {
  const body = document.body;
  const botao = document.getElementById('botaoModoApresentacao');

  body.classList.toggle('modo-apresentacao');

  if (body.classList.contains('modo-apresentacao')) {
    botao.innerText = '❌ Sair do Modo Apresentação';
  } else {
    botao.innerText = '🎥 Ativar Modo Apresentação';
  }
}

function salvarMetaMargem() {
  const meta = parseFloat(document.getElementById('metaMargem').value) || 0;
  localStorage.setItem('metaMargem', meta);
  renderizarCards(); // atualiza os indicadores
}
function calcularDecisao() {
  const checkboxes = document.querySelectorAll('#checklistDecisao input[type="checkbox"]');
  let pontosShopee = 0;
  let pontosML = 0;

  checkboxes.forEach(cb => {
    if (cb.checked) {
      if (cb.value === 'shopee') pontosShopee++;
      if (cb.value === 'ml') pontosML++;
    }
  });

  const resultado = document.getElementById('resultadoDecisao');
  if (pontosShopee > pontosML) {
    resultado.innerHTML = `✅ Melhor vender na <strong style="color: #EF5DA8;">Shopee</strong> (${pontosShopee} pontos)`;
  } else if (pontosML > pontosShopee) {
    resultado.innerHTML = `🔵 Melhor vender no <strong style="color: #0074D9;">Mercado Livre</strong> (${pontosML} pontos)`;
  } else {
    resultado.innerHTML = `⚖️ <span style="color: gray;">Empate — Avalie caso a caso ou teste ambas</span>`;
  }
}
function carregarMetaMargem() {
  const meta = parseFloat(localStorage.getItem('metaMargem')) || 0;
  const input = document.getElementById('metaMargem');
  if (input) input.value = meta;
}


function exportarExcel() {
  const registros = JSON.parse(localStorage.getItem('resultadosLucro')) || [];
  if (registros.length === 0) return alert("Nenhum cálculo para exportar!");

  const planilha = [];
registros.forEach(r => {
    const { ml, sh } = Array.isArray(r) ? { ml: r[0], sh: r[1] } : r;
  planilha.push({
      Produto: ml.produto,
      Plataforma: 'Mercado Livre',
      Preço: ml.preco,
      Taxas: ml.taxaTotal,
      Fixo: ml.fixo,
      Frete: ml.frete,
      Antecipação: ml.antecipacao,
      Transferência: ml.transferencia,
      Variável: ml.variavel,
      Sobra: ml.sobra,
      Comissão: ml.comissao,
      Imposto: ml.imposto,
      Custo: ml.custo,
      Lucro: ml.lucro,
      Margem: ml.margem
    });
    planilha.push({
      Produto: sh.produto,
      Plataforma: 'Shopee',
      Preço: sh.preco,
      Taxas: sh.taxaTotal,
      Fixo: sh.fixo,
      Frete: sh.frete,
      Antecipação: sh.antecipacao,
      Transferência: sh.transferencia,
      Variável: sh.variavel,
      Sobra: sh.sobra,
      Comissão: sh.comissao,
      Imposto: sh.imposto,
      Custo: sh.custo,
      Lucro: sh.lucro,
      Margem: sh.margem
    });
  });

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(planilha);
  XLSX.utils.book_append_sheet(wb, ws, "Lucros");
  XLSX.writeFile(wb, "relatorio-lucros.xlsx");
}
function desenharGraficoLucro(ml, sh, mg, shn) {
  const ctx = document.getElementById('graficoLucro').getContext('2d');
  if (window.graficoLucro instanceof Chart) {
    window.graficoLucro.destroy(); // Evita duplicações
  }

  window.graficoLucro = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Mercado Livre', 'Shopee', 'Magalu', 'Shein'],
      datasets: [{
        label: 'Lucro Final (R$)',
        data: [
          parseFloat(ml.lucro),
          parseFloat(sh.lucro),
          parseFloat(mg.lucro),
          parseFloat(shn.lucro)
        ],
        backgroundColor: ['#3498db', '#f39c12', '#2ecc71', '#9b59b6']
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        title: {
          display: true,
          text: 'Comparativo de Lucro por Plataforma'
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function(value) {
              return 'R$ ' + value.toFixed(2);
            }
          }
        }
      }
    }
  });
}

  </script>
  const firebaseConfig = {
    apiKey: "AIzaSyDskmCmkvGgnV9I_MkhBgHOsCoU4VarZbw",
    authDomain: "sobra-shopee.firebaseapp.com",
    projectId: "sobra-shopee",
    storageBucket: "sobra-shopee.appspot.com",
    messagingSenderId: "884927523696",
    appId: "1:884927523696:web:334f198596e85462d2bdb5"
  };

  firebase.initializeApp(firebaseConfig);
  const db = firebase.firestore();
  // Força o carregamento dos resultados do Firebase quando clica na aba "Resultados"
document.addEventListener('DOMContentLoaded', () => {
  document.querySelector('button[onclick="mostrarAba(\'resultados\')"]').addEventListener('click', async () => {
    const firebaseRegistros = await carregarResultadosFirebase();
    renderizarCards(firebaseRegistros);

    if (firebaseRegistros.length > 0) {
      const ultimo = firebaseRegistros[firebaseRegistros.length - 1];
      const { ml, sh, mg, shn } = ultimo || {};
      desenharGraficoLucro(ml, sh, mg, shn);
    }
  });
});

