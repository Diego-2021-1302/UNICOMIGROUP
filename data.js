window.MAP_DATA = {
  groups: {
    all: { key: 'all', label: 'All routes', color: '#64748b', owner: 'All participants' },
    red: { key: 'red', label: 'Red', color: '#e23a3a', owner: 'Diego — Historical and Central Places' },
    blue: { key: 'blue', label: 'Blue', color: '#2f77ff', owner: 'Jorge — Restaurants and Food Places' },
    green: { key: 'green', label: 'Green', color: '#21a55b', owner: 'Cesar — Services' },
    purple: { key: 'purple', label: 'Purple', color: '#8b4dff', owner: 'Yalenny — Cultural and Tourist Places' }
  },
  start: {
    query: 'Parque Colón, Zona Colonial, Santo Domingo, Dominican Republic',
    title: 'Parque Colón',
    description: 'This is the central square and the starting point for all routes in the project.'
  },
  places: [
    { id: 'cathedral', group: 'red', title: 'Catedral Primada de América', query: 'Catedral Primada de América, Zona Colonial, Santo Domingo, Dominican Republic', description: 'The cathedral is one of the most famous historical landmarks in the Colonial Zone.', sentence: 'The cathedral is north of Parque Colón.' },
    { id: 'alcazar', group: 'red', title: 'Alcázar de Colón', query: 'Alcázar de Colón, Zona Colonial, Santo Domingo, Dominican Republic', description: 'This palace is next to Plaza de España and is part of the historical route.', sentence: 'Alcázar de Colón is east of the cathedral.' },
    { id: 'casas-reales', group: 'red', title: 'Museo de las Casas Reales', query: 'Museo de las Casas Reales, Zona Colonial, Santo Domingo, Dominican Republic', description: 'The museum presents colonial history and is near other central monuments.', sentence: 'The museum is between Parque Colón and Alcázar de Colón.' },
    { id: 'fortaleza', group: 'red', title: 'Fortaleza Ozama', query: 'Fortaleza Ozama, Zona Colonial, Santo Domingo, Dominican Republic', description: 'This fortress is one of the oldest military buildings in the Americas.', sentence: 'Fortaleza Ozama is near the river, east of Parque Colón.' },

    { id: 'pate-palo', group: 'blue', title: 'Pat’e Palo', query: 'Pat’e Palo European Brasserie, Zona Colonial, Santo Domingo, Dominican Republic', description: 'Pat’e Palo is a famous restaurant close to Plaza de España.', sentence: 'Pat’e Palo is northeast of Parque Colón.' },
    { id: 'jalao', group: 'blue', title: 'Jalao', query: 'Jalao, Zona Colonial, Santo Domingo, Dominican Republic', description: 'Jalao is a popular food place in the central streets of the area.', sentence: 'Jalao is west of Parque Colón.' },
    { id: 'meson-bari', group: 'blue', title: 'Mesón de Bari', query: 'Mesón de Bari, Zona Colonial, Santo Domingo, Dominican Republic', description: 'This restaurant is a well-known stop for traditional food in the city center.', sentence: 'Mesón de Bari is southwest of Jalao.' },
    { id: 'pizzarelli', group: 'blue', title: 'Pizzarelli Zona Colonial', query: 'Pizzarelli Zona Colonial, Santo Domingo, Dominican Republic', description: 'Pizzarelli is part of the food route and is easy to connect from the central square.', sentence: 'Pizzarelli is west of Parque Colón and near other restaurants.' },

    { id: 'hospital', group: 'green', title: 'Hospital Padre Billini', query: 'Hospital Padre Billini, Santo Domingo, Dominican Republic', description: 'This hospital is an important service point in the Colonial Zone area.', sentence: 'The hospital is southwest of Parque Colón.' },
    { id: 'farmacia', group: 'green', title: 'Farmacia Carol', query: 'Farmacia Carol, Zona Colonial, Santo Domingo, Dominican Republic', description: 'The pharmacy is close to the service route and useful for practical directions.', sentence: 'The pharmacy is near the hospital.' },
    { id: 'banco', group: 'green', title: 'Banco Popular', query: 'Banco Popular, Zona Colonial, Santo Domingo, Dominican Republic', description: 'This bank is another service point in the downtown route.', sentence: 'The bank is east of the hospital.' },
    { id: 'bus-stop', group: 'green', title: 'Bus Stop Parque Enriquillo', query: 'Parque Enriquillo, Santo Domingo, Dominican Republic', description: 'The bus stop area helps explain public transportation and directions from the center.', sentence: 'The bus stop is west of Parque Colón.' },

    { id: 'ambar', group: 'purple', title: 'Museo del Ámbar', query: 'Museo del Ámbar Dominicano, Zona Colonial, Santo Domingo, Dominican Republic', description: 'The amber museum is part of the cultural and tourist route.', sentence: 'The amber museum is southeast of Parque Colón.' },
    { id: 'larimar', group: 'purple', title: 'Museo de Larimar', query: 'Museo del Larimar, Zona Colonial, Santo Domingo, Dominican Republic', description: 'This museum presents the famous Dominican larimar stone.', sentence: 'The larimar museum is south of the amber museum.' },
    { id: 'panteon', group: 'purple', title: 'Panteón Nacional', query: 'Panteón de la Patria, Zona Colonial, Santo Domingo, Dominican Republic', description: 'The National Pantheon is one of the key cultural and civic landmarks in the area.', sentence: 'The National Pantheon is east of Parque Colón.' },
    { id: 'ruinas', group: 'purple', title: 'Ruinas de San Francisco', query: 'Ruinas de San Francisco, Zona Colonial, Santo Domingo, Dominican Republic', description: 'The ruins are one of the most iconic historical and cultural sites in the area.', sentence: 'The ruins are north of Parque Duarte.' }
  ]
};
