// ==================== ESPERAR A QUE CARGUE EL DOM ====================
document.addEventListener('DOMContentLoaded', () => {
  console.log('🎮 PokéFinder iniciado');
  inicializarApp();
});

// ==================== VARIABLES GLOBALES ====================
let estado = {
  currentPokemonId: 1,
  searchMode: 'pokemon',
  pokemonVS1: null,
  pokemonVS2: null,
  favorites: JSON.parse(localStorage.getItem('pokemonFavorites')) || [],
  history: JSON.parse(localStorage.getItem('pokemonHistory')) || []
};

const typeColors = {
  normal: '#A8A878', fire: '#F08030', water: '#6890F0',
  electric: '#F8D030', grass: '#78C850', ice: '#98D8D8',
  fighting: '#C03028', poison: '#A040A0', ground: '#E0C068',
  flying: '#A890F0', psychic: '#F85888', bug: '#A8B820',
  rock: '#B8A038', ghost: '#705898', dragon: '#7038F8',
  dark: '#705848', steel: '#B8B8D0', fairy: '#EE99AC'
};

const typeEffectiveness = {
  fire: { superEffective: ['grass', 'ice', 'bug', 'steel'], notVery: ['fire', 'water', 'rock', 'dragon'] },
  water: { superEffective: ['fire', 'ground', 'rock'], notVery: ['water', 'grass', 'dragon'] },
  electric: { superEffective: ['water', 'flying'], notVery: ['electric', 'grass', 'dragon'], noEffect: ['ground'] },
  grass: { superEffective: ['water', 'ground', 'rock'], notVery: ['fire', 'grass', 'poison', 'flying', 'bug', 'dragon', 'steel'] },
  ice: { superEffective: ['grass', 'ground', 'flying', 'dragon'], notVery: ['fire', 'water', 'ice', 'steel'] },
  fighting: { superEffective: ['normal', 'ice', 'rock', 'dark', 'steel'], notVery: ['poison', 'flying', 'psychic', 'bug', 'fairy'], noEffect: ['ghost'] },
  poison: { superEffective: ['grass', 'fairy'], notVery: ['poison', 'ground', 'rock', 'ghost'], noEffect: ['steel'] },
  ground: { superEffective: ['fire', 'electric', 'poison', 'rock', 'steel'], notVery: ['grass', 'bug'], noEffect: ['flying'] },
  flying: { superEffective: ['grass', 'fighting', 'bug'], notVery: ['electric', 'rock', 'steel'] },
  psychic: { superEffective: ['fighting', 'poison'], notVery: ['psychic', 'steel'], noEffect: ['dark'] },
  bug: { superEffective: ['grass', 'psychic', 'dark'], notVery: ['fire', 'fighting', 'poison', 'flying', 'ghost', 'steel', 'fairy'] },
  rock: { superEffective: ['fire', 'ice', 'flying', 'bug'], notVery: ['fighting', 'ground', 'steel'] },
  ghost: { superEffective: ['psychic', 'ghost'], notVery: ['dark'], noEffect: ['normal'] },
  dragon: { superEffective: ['dragon'], notVery: ['steel'], noEffect: ['fairy'] },
  dark: { superEffective: ['psychic', 'ghost'], notVery: ['fighting', 'dark', 'fairy'] },
  steel: { superEffective: ['ice', 'rock', 'fairy'], notVery: ['fire', 'water', 'electric', 'steel'] },
  fairy: { superEffective: ['fighting', 'dragon', 'dark'], notVery: ['fire', 'poison', 'steel'] }
};

// ==================== INICIALIZAR ====================
function inicializarApp() {
  console.log('Inicializando eventos...');
  
  // Menú
  document.getElementById('menuBuscar').addEventListener('click', () => cambiarVista('buscar'));
  document.getElementById('menuHistorico').addEventListener('click', () => cambiarVista('historico'));
  document.getElementById('menuVS').addEventListener('click', () => cambiarVista('vs'));
  document.getElementById('menuFavoritos').addEventListener('click', () => cambiarVista('favoritos'));
  
  // Búsqueda
  document.getElementById('btnBuscar').addEventListener('click', buscarPokemon);
  document.getElementById('pokemonInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') buscarPokemon();
  });
  
  // Flechas
  document.getElementById('btnArrowUp').addEventListener('click', () => {
    if (estado.currentPokemonId > 1) {
      estado.currentPokemonId--;
      document.getElementById('pokemonInput').value = estado.currentPokemonId;
      buscarPokemon();
    }
  });
  
  document.getElementById('btnArrowDown').addEventListener('click', () => {
    if (estado.currentPokemonId < 1025) {
      estado.currentPokemonId++;
      document.getElementById('pokemonInput').value = estado.currentPokemonId;
      buscarPokemon();
    }
  });
  
  // Toggle búsqueda
  document.getElementById('btnToggleSearch').addEventListener('click', () => {
    const btn = document.getElementById('btnToggleSearch');
    const label = document.getElementById('searchTypeLabel');
    const input = document.getElementById('pokemonInput');
    
    if (estado.searchMode === 'pokemon') {
      estado.searchMode = 'ability';
      label.textContent = 'HABILIDAD';
      btn.style.background = '#9b59b6';
      input.placeholder = 'Nombre de habilidad...';
    } else {
      estado.searchMode = 'pokemon';
      label.textContent = 'POKÉMON';
      btn.style.background = '#f4d03f';
      input.placeholder = 'Nombre o ID...';
    }
  });
  
  // VS
  document.getElementById('btnVsBuscar1').addEventListener('click', () => {
    buscarPokemonVS(
      document.getElementById('vsInput1'),
      document.getElementById('vsPokemon1'),
      1
    );
  });
  
  document.getElementById('btnVsBuscar2').addEventListener('click', () => {
    buscarPokemonVS(
      document.getElementById('vsInput2'),
      document.getElementById('vsPokemon2'),
      2
    );
  });
  
  document.getElementById('vsInput1').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      buscarPokemonVS(
        document.getElementById('vsInput1'),
        document.getElementById('vsPokemon1'),
        1
      );
    }
  });
  
  document.getElementById('vsInput2').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      buscarPokemonVS(
        document.getElementById('vsInput2'),
        document.getElementById('vsPokemon2'),
        2
      );
    }
  });
  
  document.getElementById('btnBattle').addEventListener('click', iniciarBatalla);
  
  // Limpiar
  document.getElementById('btnClearFavorites').addEventListener('click', () => {
    if (confirm('¿Eliminar todos los favoritos?')) {
      estado.favorites = [];
      localStorage.setItem('pokemonFavorites', JSON.stringify(estado.favorites));
      mostrarFavoritos();
    }
  });
  
  document.getElementById('btnClearHistory').addEventListener('click', () => {
    if (confirm('¿Eliminar todo el histórico?')) {
      estado.history = [];
      localStorage.setItem('pokemonHistory', JSON.stringify(estado.history));
      mostrarHistorico();
    }
  });
  
  console.log('✅ Eventos inicializados');
}

// ==================== CACHE ====================
function getFromCache(key) {
  const cached = localStorage.getItem(key);
  if (!cached) return null;
  
  const data = JSON.parse(cached);
  const now = Date.now();
  const ttl = 24 * 60 * 60 * 1000;
  
  if (now - data.timestamp > ttl) {
    localStorage.removeItem(key);
    return null;
  }
  
  return data.value;
}

function saveToCache(key, value) {
  const data = { value, timestamp: Date.now() };
  localStorage.setItem(key, JSON.stringify(data));
}

// ==================== NAVEGACIÓN ====================
function cambiarVista(vista) {
  console.log('Cambiando a vista:', vista);
  
  document.querySelectorAll('.menu-item').forEach(item => {
    item.classList.remove('menu-active');
  });
  
  document.getElementById('searchArea').style.display = 'none';
  document.getElementById('resultado').style.display = 'none';
  document.getElementById('historyView').style.display = 'none';
  document.getElementById('vsView').style.display = 'none';
  document.getElementById('favoritesView').style.display = 'none';
  
  switch(vista) {
    case 'buscar':
      document.getElementById('menuBuscar').classList.add('menu-active');
      document.getElementById('searchArea').style.display = 'flex';
      document.getElementById('resultado').style.display = 'block';
      break;
    case 'historico':
      document.getElementById('menuHistorico').classList.add('menu-active');
      document.getElementById('historyView').style.display = 'block';
      mostrarHistorico();
      break;
    case 'vs':
      document.getElementById('menuVS').classList.add('menu-active');
      document.getElementById('vsView').style.display = 'block';
      break;
    case 'favoritos':
      document.getElementById('menuFavoritos').classList.add('menu-active');
      document.getElementById('favoritesView').style.display = 'block';
      mostrarFavoritos();
      break;
  }
}

// ==================== BÚSQUEDA ====================
async function buscarPokemon() {
  console.log('Buscando Pokémon...');
  
  const valor = document.getElementById('pokemonInput').value.trim().toLowerCase();
  
  if (!valor) {
    mostrarError('Por favor ingresa un nombre o número');
    return;
  }
  
  if (estado.searchMode === 'ability') {
    buscarHabilidad(valor);
    return;
  }
  
  document.getElementById('resultado').innerHTML = '<div class="loading">🔄 Buscando...</div>';
  
  const cacheKey = `pokemon_${valor}`;
  const cached = getFromCache(cacheKey);
  
  if (cached) {
    console.log('Datos desde caché');
    mostrarPokemon(cached.data, cached.evolution, 'cache');
    return;
  }
  
  try {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${valor}`);
    if (!res.ok) throw new Error();
    const data = await res.json();
    
    const speciesRes = await fetch(data.species.url);
    const speciesData = await speciesRes.json();
    const evolutionRes = await fetch(speciesData.evolution_chain.url);
    const evolutionData = await evolutionRes.json();
    
    saveToCache(cacheKey, { data, evolution: evolutionData });
    guardarEnHistorico(data);
    estado.currentPokemonId = data.id;
    
    mostrarPokemon(data, evolutionData, 'api');
    
  } catch {
    mostrarError('❌ Pokémon no encontrado');
  }
}

async function buscarHabilidad(nombre) {
  document.getElementById('resultado').innerHTML = '<div class="loading">🔄 Buscando habilidad...</div>';
  
  try {
    const res = await fetch(`https://pokeapi.co/api/v2/ability/${nombre}`);
    if (!res.ok) throw new Error();
    const data = await res.json();
    
    const descripcion = data.effect_entries.find(e => e.language.name === 'es') || 
                        data.effect_entries.find(e => e.language.name === 'en');
    
    let html = `
      <article class="pokemon-card" style="padding: 24px;">
        <h2 style="text-align: center; margin-bottom: 20px; font-size: 18px;">
          ⚡ ${data.name.toUpperCase()}
        </h2>
        
        <div style="background: #f5f5f5; padding: 16px; border: 3px solid #222; margin-bottom: 20px;">
          <h3 style="font-size: 12px; margin-bottom: 8px;">DESCRIPCIÓN:</h3>
          <p style="font-size: 12px; line-height: 1.6;">
            ${descripcion ? descripcion.effect : 'No disponible'}
          </p>
        </div>
        
        <h3 style="font-size: 13px; margin-bottom: 12px; text-align: center;">
          POKÉMON CON ESTA HABILIDAD (${data.pokemon.length})
        </h3>
        
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">
    `;
    
    for (let i = 0; i < Math.min(12, data.pokemon.length); i++) {
      const pokemonName = data.pokemon[i].pokemon.name;
      const pokemonId = data.pokemon[i].pokemon.url.split('/').slice(-2, -1)[0];
      
      html += `
        <div class="evolution-card" style="cursor: pointer; height: 110px;" 
             onclick="buscarPokemonPorNombre('${pokemonName}')">
          <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png" 
               style="width: 50px;">
          <span style="font-size: 9px; font-weight: bold;">${pokemonName.toUpperCase()}</span>
        </div>
      `;
    }
    
    html += `</div></article>`;
    document.getElementById('resultado').innerHTML = html;
    
  } catch {
    mostrarError('❌ Habilidad no encontrada');
  }
}

window.buscarPokemonPorNombre = function(nombre) {
  estado.searchMode = 'pokemon';
  document.getElementById('searchTypeLabel').textContent = 'POKÉMON';
  document.getElementById('btnToggleSearch').style.background = '#f4d03f';
  document.getElementById('pokemonInput').placeholder = 'Nombre o ID...';
  document.getElementById('pokemonInput').value = nombre;
  buscarPokemon();
};

function mostrarPokemon(data, evolutionData, origin) {
  const template = document.getElementById('pokemon-template');
  const clone = template.content.cloneNode(true);
  
  clone.querySelector('.pokemon-name').textContent = 
    data.name.charAt(0).toUpperCase() + data.name.slice(1);
  clone.querySelector('.pokemon-id').textContent = 
    `#${String(data.id).padStart(3, '0')}`;
  
  const originBadge = clone.querySelector('.data-origin');
  if (origin === 'api') {
    originBadge.textContent = 'DESDE API';
    originBadge.classList.add('from-api');
  } else {
    originBadge.textContent = 'DESDE CACHÉ';
    originBadge.classList.add('from-cache');
  }
  
  const img = clone.querySelector('.pokemon-image');
  img.src = data.sprites.other['official-artwork'].front_default || data.sprites.front_default;
  img.alt = data.name;
  
  const typesContainer = clone.querySelector('.types-container');
  data.types.forEach(typeInfo => {
    const badge = document.createElement('span');
    badge.className = 'type-badge';
    badge.textContent = typeInfo.type.name.toUpperCase();
    badge.style.backgroundColor = typeColors[typeInfo.type.name] || '#777';
    typesContainer.appendChild(badge);
  });
  
  const statRows = clone.querySelectorAll('.stat-row');
  data.stats.forEach((stat, index) => {
    const value = stat.base_stat;
    const percentage = (value / 255) * 100;
    
    const statBar = statRows[index].querySelector('.stat-bar');
    const statValue = statRows[index].querySelector('.stat-value');
    
    statBar.style.width = `${percentage}%`;
    statValue.textContent = value;
  });
  
  const btnFav = clone.querySelector('#btnFavorite');
  const isFavorite = estado.favorites.some(f => f.id === data.id);
  if (isFavorite) {
    btnFav.classList.add('is-favorite');
  }
  btnFav.addEventListener('click', () => toggleFavorite(data, btnFav));
  
  mostrarCadenaEvolutiva(clone, evolutionData);
  
  document.getElementById('resultado').innerHTML = '';
  document.getElementById('resultado').appendChild(clone);
}

async function mostrarCadenaEvolutiva(clone, evolutionData) {
  const evolutionChain = clone.querySelector('#evolutionChain');
  const noEvolution = clone.querySelector('.no-evolution');
  
  const evolutions = [];
  let current = evolutionData.chain;
  
  do {
    evolutions.push({
      name: current.species.name,
      id: current.species.url.split('/').slice(-2, -1)[0]
    });
    current = current.evolves_to[0];
  } while (current);
  
  if (evolutions.length === 1) {
    evolutionChain.style.display = 'none';
    noEvolution.style.display = 'block';
    return;
  }
  
  for (let i = 0; i < evolutions.length; i++) {
    const evo = evolutions[i];
    
    try {
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${evo.id}`);
      const evoData = await res.json();
      
      const card = document.createElement('div');
      card.className = 'evolution-card';
      card.innerHTML = `
        <img class="evolution-image" 
             src="${evoData.sprites.other['official-artwork'].front_default || evoData.sprites.front_default}" 
             alt="${evo.name}">
        <span class="evolution-name">${evo.name.toUpperCase()}</span>
      `;
      card.addEventListener('click', () => {
        document.getElementById('pokemonInput').value = evo.name;
        buscarPokemon();
      });
      
      evolutionChain.appendChild(card);
      
      if (i < evolutions.length - 1) {
        const arrow = document.createElement('span');
        arrow.className = 'evolution-arrow';
        arrow.textContent = '→';
        evolutionChain.appendChild(arrow);
      }
    } catch (error) {
      console.error(`Error: ${evo.name}`);
    }
  }
}

function mostrarError(mensaje) {
  document.getElementById('resultado').innerHTML = `
    <div class="empty-state"><p>${mensaje}</p></div>
  `;
}

// ==================== FAVORITOS ====================
function toggleFavorite(data, btnElement) {
  const index = estado.favorites.findIndex(f => f.id === data.id);
  
  if (index === -1) {
    estado.favorites.push({
      id: data.id,
      name: data.name,
      image: data.sprites.other['official-artwork'].front_default || data.sprites.front_default,
      types: data.types.map(t => t.type.name)
    });
    btnElement.classList.add('is-favorite');
  } else {
    estado.favorites.splice(index, 1);
    btnElement.classList.remove('is-favorite');
  }
  
  localStorage.setItem('pokemonFavorites', JSON.stringify(estado.favorites));
}

function mostrarFavoritos() {
  const favoritesList = document.getElementById('favoritesList');
  favoritesList.innerHTML = '';
  
  if (estado.favorites.length === 0) {
    document.getElementById('noFavorites').style.display = 'block';
    document.getElementById('btnClearFavorites').style.display = 'none';
    return;
  }
  
  document.getElementById('noFavorites').style.display = 'none';
  document.getElementById('btnClearFavorites').style.display = 'block';
  
  estado.favorites.forEach(pokemon => {
    const item = document.createElement('div');
    item.className = 'favorite-item';
    
    item.innerHTML = `
      <div class="favorite-content">
        <div class="favorite-pokemon-img">
          <img src="${pokemon.image}" alt="${pokemon.name}">
        </div>
        <div class="favorite-info">
          <span class="favorite-id">#${String(pokemon.id).padStart(3, '0')}</span>
          <span class="favorite-name">${pokemon.name.toUpperCase()}</span>
          <div class="favorite-badges">
            ${pokemon.types.map(type => 
              `<span class="favorite-type" style="background: ${typeColors[type]}">${type.toUpperCase()}</span>`
            ).join('')}
          </div>
        </div>
      </div>
      <button class="btn-remove-favorite">🗑️</button>
    `;
    
    item.querySelector('.favorite-content').addEventListener('click', () => {
      cambiarVista('buscar');
      document.getElementById('pokemonInput').value = pokemon.name;
      buscarPokemon();
    });
    
    item.querySelector('.btn-remove-favorite').addEventListener('click', (e) => {
      e.stopPropagation();
      estado.favorites = estado.favorites.filter(f => f.id !== pokemon.id);
      localStorage.setItem('pokemonFavorites', JSON.stringify(estado.favorites));
      mostrarFavoritos();
    });
    
    favoritesList.appendChild(item);
  });
}

// ==================== HISTÓRICO ====================
function guardarEnHistorico(data) {
  if (estado.history.some(p => p.id === data.id)) return;
  
  estado.history.unshift({
    id: data.id,
    name: data.name,
    image: data.sprites.other['official-artwork'].front_default || data.sprites.front_default,
    types: data.types.map(t => t.type.name)
  });
  
  if (estado.history.length > 20) estado.history.pop();
  
  localStorage.setItem('pokemonHistory', JSON.stringify(estado.history));
}

function mostrarHistorico() {
  const historyList = document.getElementById('historyList');
  historyList.innerHTML = '';
  
  if (estado.history.length === 0) {
    document.getElementById('noHistory').style.display = 'block';
    document.getElementById('btnClearHistory').style.display = 'none';
    return;
  }
  
  document.getElementById('noHistory').style.display = 'none';
  document.getElementById('btnClearHistory').style.display = 'block';
  
  estado.history.forEach(pokemon => {
    const item = document.createElement('div');
    item.className = 'history-item';
    
    item.innerHTML = `
      <div class="history-content">
        <div class="history-pokemon-img">
          <img src="${pokemon.image}" alt="${pokemon.name}">
        </div>
        <div class="history-info">
          <span class="history-id">#${String(pokemon.id).padStart(3, '0')}</span>
          <span class="history-name">${pokemon.name.toUpperCase()}</span>
        </div>
      </div>
      <div class="history-actions">
        <button class="btn-add-favorite">❤️</button>
        <button class="btn-remove-favorite">🗑️</button>
      </div>
    `;
    
    item.querySelector('.history-content').addEventListener('click', () => {
      cambiarVista('buscar');
      document.getElementById('pokemonInput').value = pokemon.name;
      buscarPokemon();
    });
    
    item.querySelector('.btn-add-favorite').addEventListener('click', (e) => {
      e.stopPropagation();
      if (estado.favorites.some(f => f.id === pokemon.id)) {
        alert('Ya está en favoritos ❤️');
        return;
      }
      estado.favorites.push(pokemon);
      localStorage.setItem('pokemonFavorites', JSON.stringify(estado.favorites));
      alert(`${pokemon.name.toUpperCase()} agregado ❤️`);
    });
    
    item.querySelector('.btn-remove-favorite').addEventListener('click', (e) => {
      e.stopPropagation();
      estado.history = estado.history.filter(p => p.id !== pokemon.id);
      localStorage.setItem('pokemonHistory', JSON.stringify(estado.history));
      mostrarHistorico();
    });
    
    historyList.appendChild(item);
  });
}

// ==================== VS BATTLE ====================
async function buscarPokemonVS(input, card, numero) {
  const valor = input.value.trim().toLowerCase();
  
  if (!valor) {
    card.innerHTML = '<div class="vs-placeholder">?</div>';
    return;
  }
  
  card.innerHTML = '<p style="text-align: center; padding: 20px;">🔄 Buscando...</p>';
  
  const cacheKey = `pokemon_${valor}`;
  const cached = getFromCache(cacheKey);
  let data, origin;
  
  if (cached) {
    data = cached.data;
    origin = 'cache';
  } else {
    try {
      const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${valor}`);
      if (!res.ok) throw new Error();
      data = await res.json();
      origin = 'api';
      
      const speciesRes = await fetch(data.species.url);
      const speciesData = await speciesRes.json();
      const evolutionRes = await fetch(speciesData.evolution_chain.url);
      const evolutionData = await evolutionRes.json();
      saveToCache(cacheKey, { data, evolution: evolutionData });
    } catch {
      card.innerHTML = '<p style="text-align: center; color: #ff6b6b;">❌ No encontrado</p>';
      return;
    }
  }
  
  const totalPower = data.stats.reduce((sum, stat) => sum + stat.base_stat, 0);
  
  if (numero === 1) {
    estado.pokemonVS1 = { name: data.name, power: totalPower, types: data.types, stats: data.stats, data };
  } else {
    estado.pokemonVS2 = { name: data.name, power: totalPower, types: data.types, stats: data.stats, data };
  }
  
  card.innerHTML = `
    <span class="vs-origin ${origin}">${origin === 'api' ? 'API' : 'CACHÉ'}</span>
    <img src="${data.sprites.other['official-artwork'].front_default || data.sprites.front_default}" alt="${data.name}">
    <div class="vs-pokemon-info">
      <div class="vs-pokemon-name">#${data.id} ${data.name.toUpperCase()}</div>
      <div class="vs-types">
        ${data.types.map(t => 
          `<span class="vs-type" style="background: ${typeColors[t.type.name]}">${t.type.name.toUpperCase()}</span>`
        ).join('')}
      </div>
      <div style="margin-top: 8px; font-size: 11px; font-weight: bold;">
        Total: ${totalPower} pts
      </div>
    </div>
  `;
}

function iniciarBatalla() {
  if (!estado.pokemonVS1 || !estado.pokemonVS2) {
    alert('Debes buscar dos Pokémon primero');
    return;
  }
  
  const p1 = estado.pokemonVS1;
  const p2 = estado.pokemonVS2;
  
  let multiplicadorP1 = 1;
  let multiplicadorP2 = 1;
  let ventajasP1 = [];
  let ventajasP2 = [];
  
  p1.types.forEach(typeObj => {
    const attackerType = typeObj.type.name;
    p2.types.forEach(defenderTypeObj => {
      const defenderType = defenderTypeObj.type.name;
      const effectiveness = typeEffectiveness[attackerType];
      
      if (effectiveness) {
        if (effectiveness.superEffective && effectiveness.superEffective.includes(defenderType)) {
          multiplicadorP1 *= 2;
          ventajasP1.push(`${attackerType} es súper efectivo contra ${defenderType}`);
        }
        if (effectiveness.notVery && effectiveness.notVery.includes(defenderType)) {
          multiplicadorP1 *= 0.5;
        }
        if (effectiveness.noEffect && effectiveness.noEffect.includes(defenderType)) {
          multiplicadorP1 *= 0;
        }
      }
    });
  });
  
  p2.types.forEach(typeObj => {
    const attackerType = typeObj.type.name;
    p1.types.forEach(defenderTypeObj => {
      const defenderType = defenderTypeObj.type.name;
      const effectiveness = typeEffectiveness[attackerType];
      
      if (effectiveness) {
        if (effectiveness.superEffective && effectiveness.superEffective.includes(defenderType)) {
          multiplicadorP2 *= 2;
          ventajasP2.push(`${attackerType} es súper efectivo contra ${defenderType}`);
        }
        if (effectiveness.notVery && effectiveness.notVery.includes(defenderType)) {
          multiplicadorP2 *= 0.5;
        }
        if (effectiveness.noEffect && effectiveness.noEffect.includes(defenderType)) {
          multiplicadorP2 *= 0;
        }
      }
    });
  });
  
  const puntajeP1 = p1.power * multiplicadorP1;
  const puntajeP2 = p2.power * multiplicadorP2;
  
  let winner = '';
  let winnerClass = '';
  if (puntajeP1 > puntajeP2) {
    winner = `🏆 ${p1.name.toUpperCase()} GANA LA BATALLA`;
    winnerClass = 'winner1';
  } else if (puntajeP2 > puntajeP1) {
    winner = `🏆 ${p2.name.toUpperCase()} GANA LA BATALLA`;
    winnerClass = 'winner2';
  } else {
    winner = '🤝 EMPATE TOTAL';
    winnerClass = 'tie';
  }
  
  let html = `
    <div class="vs-winner ${winnerClass}">${winner}</div>
    
    <h3 class="vs-analysis-title">📊 ANÁLISIS DE BATALLA</h3>
    
    <div class="vs-type-advantages">
      <h4 style="font-size: 12px; margin-bottom: 8px; font-weight: bold;">⚡ VENTAJAS DE TIPO</h4>
  `;
  
  if (ventajasP1.length > 0) {
    ventajasP1.forEach(ventaja => {
      html += `<div class="vs-advantage-row advantage">
        <strong>${p1.name}:</strong> ${ventaja} (×${multiplicadorP1})
      </div>`;
    });
  }
  
  if (ventajasP2.length > 0) {
    ventajasP2.forEach(ventaja => {
      html += `<div class="vs-advantage-row advantage">
        <strong>${p2.name}:</strong> ${ventaja} (×${multiplicadorP2})
      </div>`;
    });
  }
  
  if (ventajasP1.length === 0 && ventajasP2.length === 0) {
    html += `<div style="text-align: center; padding: 12px; color: #666; font-size: 11px;">
      No hay ventajas significativas de tipo
    </div>`;
  }
  
  html += `</div>`;
  
  html += `
    <h3 class="vs-analysis-title">📈 COMPARACIÓN DE STATS</h3>
    <div class="vs-stats-comparison">
  `;
  
  const statNames = ['HP', 'ATK', 'DEF', 'SP.ATK', 'SP.DEF', 'SPD'];
  
  p1.stats.forEach((stat, index) => {
    const p1Value = stat.base_stat;
    const p2Value = p2.stats[index].base_stat;
    const maxValue = Math.max(p1Value, p2Value);
    const p1Percent = (p1Value / maxValue) * 100;
    const p2Percent = (p2Value / maxValue) * 100;
    
    html += `
      <div class="vs-stat-row">
        <span class="vs-stat-value">${p1Value}</span>
        <div class="vs-stat-bar">
          <div class="vs-stat-fill player1" style="width: ${p1Percent}%"></div>
        </div>
        <span class="vs-stat-label">${statNames[index]}</span>
        <div class="vs-stat-bar">
          <div class="vs-stat-fill player2" style="width: ${p2Percent}%"></div>
        </div>
        <span class="vs-stat-value">${p2Value}</span>
      </div>
    `;
  });
  
  html += `</div>`;
  
  html += `
    <h3 class="vs-analysis-title">🧮 CÁLCULO DEL PUNTAJE</h3>
    <div class="vs-total-section">
      <div class="vs-total-title">Stats Base Total:</div>
      <div style="display: flex; justify-content: space-around; margin-bottom: 12px;">
        <div><strong>${p1.name}:</strong> ${p1.power}</div>
        <div><strong>${p2.name}:</strong> ${p2.power}</div>
      </div>
      
      <div class="vs-total-title">Multiplicador de Tipo:</div>
      <div style="display: flex; justify-content: space-around; margin-bottom: 12px;">
        <div><strong>${p1.name}:</strong> ×${multiplicadorP1.toFixed(2)}</div>
        <div><strong>${p2.name}:</strong> ×${multiplicadorP2.toFixed(2)}</div>
      </div>
      
      <div style="border-top: 3px solid #222; margin: 12px 0; padding-top: 12px;">
        <div class="vs-total-title">Puntaje Final:</div>
        <div class="vs-total-comparison">
          <div class="vs-total-value" style="color: ${puntajeP1 > puntajeP2 ? '#2e7d32' : '#666'}">
            ${puntajeP1.toFixed(1)}
          </div>
          <div style="font-size: 20px;">VS</div>
          <div class="vs-total-value" style="color: ${puntajeP2 > puntajeP1 ? '#c62828' : '#666'}">
            ${puntajeP2.toFixed(1)}
          </div>
        </div>
      </div>
    </div>
  `;
  
  document.getElementById('vsResult').innerHTML = html;
}