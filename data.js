'use strict';
/* ==========================================================================
   Datos de ejemplo del restaurante "La Gracia de Dios" (Cartagena de Indias).
   El proyecto de aula no incluye la carta del local; este menú es una propuesta
   de comida rápida con sabor costeño, coherente con el documento (público local
   y turístico, proveedores de plazas de mercado y pescadores, gasto por persona
   de $25.000–$50.000). Edita este archivo para ajustar productos, insumos y
   precios: el resto de la aplicación se adapta solo.
   Cada producto lleva su receta (r): { idInsumo: cantidad }.
   ========================================================================== */

const CATS = [
  { id: 'all', name: 'Todo', e: '🍽️', tone: '#E8E4DA' },
  { id: 'com', name: 'Combos', e: '⭐', tone: '#F3E7C7' },
  { id: 'ham', name: 'Hamburguesas', e: '🍔', tone: '#EBDCC8' },
  { id: 'per', name: 'Perros', e: '🌭', tone: '#EDD9D2' },
  { id: 'sal', name: 'Salchipapas', e: '🍟', tone: '#F1E4BE' },
  { id: 'pol', name: 'Pollo', e: '🍗', tone: '#EEDCC3' },
  { id: 'cri', name: 'Criollos', e: '🫓', tone: '#E1E6CC' },
  { id: 'mar', name: 'Del mar', e: '🐟', tone: '#D6E4EA' },
  { id: 'fri', name: 'Fritos', e: '🥟', tone: '#EADFC8' },
  { id: 'beb', name: 'Bebidas', e: '🥤', tone: '#D4E6DC' }
];

const SUPPLIES = [
  { id: 'pan_h', name: 'Pan de hamburguesa', unit: 'und', stock: 60, min: 20, cost: 900 },
  { id: 'carne', name: 'Carne de res 120 g', unit: 'und', stock: 55, min: 20, cost: 2800 },
  { id: 'pan_p', name: 'Pan de perro', unit: 'und', stock: 45, min: 15, cost: 700 },
  { id: 'salch', name: 'Salchicha', unit: 'und', stock: 50, min: 15, cost: 1200 },
  { id: 'papa', name: 'Papa a la francesa (porción)', unit: 'porc', stock: 70, min: 25, cost: 1100 },
  { id: 'pollo', name: 'Pollo apanado (presa)', unit: 'und', stock: 40, min: 15, cost: 3200 },
  { id: 'queso', name: 'Queso costeño (porción)', unit: 'porc', stock: 80, min: 25, cost: 500 },
  { id: 'toc', name: 'Tocineta (porción)', unit: 'porc', stock: 14, min: 15, cost: 700 },
  { id: 'huevo', name: 'Huevos', unit: 'und', stock: 70, min: 20, cost: 450 },
  { id: 'masa', name: 'Masa de maíz (porción)', unit: 'porc', stock: 60, min: 20, cost: 600 },
  { id: 'yuca', name: 'Masa de yuca (porción)', unit: 'porc', stock: 40, min: 15, cost: 700 },
  { id: 'rell', name: 'Carne molida para relleno', unit: 'porc', stock: 40, min: 15, cost: 900 },
  { id: 'desm', name: 'Carne o pollo desmechado (porción)', unit: 'porc', stock: 35, min: 12, cost: 2200 },
  { id: 'plat', name: 'Plátano verde para patacón', unit: 'porc', stock: 60, min: 20, cost: 700 },
  { id: 'mad', name: 'Plátano maduro (porción)', unit: 'porc', stock: 30, min: 10, cost: 500 },
  { id: 'pesc', name: 'Filete de pescado (porción)', unit: 'und', stock: 18, min: 8, cost: 6500 },
  { id: 'cam', name: 'Camarones (porción)', unit: 'porc', stock: 14, min: 6, cost: 9000 },
  { id: 'fruta', name: 'Fruta para jugo (porción)', unit: 'porc', stock: 9, min: 10, cost: 1400 },
  { id: 'leche', name: 'Leche (vaso)', unit: 'porc', stock: 25, min: 10, cost: 800 },
  { id: 'coco', name: 'Base de limonada de coco', unit: 'porc', stock: 25, min: 8, cost: 1500 },
  { id: 'avena', name: 'Avena fría (vaso)', unit: 'porc', stock: 30, min: 10, cost: 900 },
  { id: 'gas', name: 'Gaseosa 400 ml', unit: 'und', stock: 48, min: 18, cost: 1500 },
  { id: 'agua', name: 'Agua en botella', unit: 'und', stock: 36, min: 12, cost: 900 },
  { id: 'suero', name: 'Suero costeño (porción)', unit: 'porc', stock: 90, min: 30, cost: 300 },
  { id: 'ens', name: 'Ensalada fresca (porción)', unit: 'porc', stock: 40, min: 15, cost: 600 },
  { id: 'sals', name: 'Salsas y vegetales (kit)', unit: 'kit', stock: 150, min: 40, cost: 400 }
];

const PRODUCTS = [
  // Combos
  { id: 'k1', name: 'Combo clásico', d: 'Hamburguesa, papas y gaseosa', cat: 'com', e: '⭐', price: 24000, r: { pan_h: 1, carne: 1, queso: 1, sals: 1, papa: 1, gas: 1 } },
  { id: 'k2', name: 'Combo perro', d: 'Perro, papas y gaseosa', cat: 'com', e: '⭐', price: 17000, r: { pan_p: 1, salch: 1, queso: 1, sals: 1, papa: 1, gas: 1 } },
  { id: 'k3', name: 'Combo cartagenero', d: 'Patacón relleno, empanada y limonada de coco', cat: 'com', e: '⭐', price: 25000, r: { plat: 2, desm: 1, queso: 1, suero: 1, sals: 1, masa: 1, rell: 1, coco: 1 } },
  { id: 'k4', name: 'Combo familiar', d: '2 hamburguesas, salchipapa y 2 gaseosas', cat: 'com', e: '👨‍👩‍👧', price: 52000, r: { pan_h: 2, carne: 2, queso: 3, sals: 3, papa: 1, salch: 1, gas: 2 } },
  // Hamburguesas
  { id: 'h1', name: 'Hamburguesa clásica', d: 'Carne, queso y vegetales', cat: 'ham', e: '🍔', price: 16000, r: { pan_h: 1, carne: 1, queso: 1, sals: 1 } },
  { id: 'h2', name: 'Hamburguesa doble', d: 'Doble carne y queso', cat: 'ham', e: '🍔', price: 22000, r: { pan_h: 1, carne: 2, queso: 2, sals: 1 } },
  { id: 'h3', name: 'Gracia Especial', d: 'Tocineta y huevo', cat: 'ham', e: '🍔', price: 24000, r: { pan_h: 1, carne: 1, queso: 1, toc: 2, huevo: 1, sals: 1 } },
  { id: 'h4', name: 'Hamburguesa costeña', d: 'Queso costeño y plátano maduro', cat: 'ham', e: '🍔', price: 21000, r: { pan_h: 1, carne: 1, queso: 2, mad: 1, suero: 1, sals: 1 } },
  // Perros
  { id: 'p1', name: 'Perro sencillo', cat: 'per', e: '🌭', price: 9000, r: { pan_p: 1, salch: 1, queso: 1, sals: 1 } },
  { id: 'p2', name: 'Perro especial', d: 'Con tocineta', cat: 'per', e: '🌭', price: 13000, r: { pan_p: 1, salch: 1, queso: 2, toc: 1, sals: 1 } },
  { id: 'p3', name: 'Perro Gracia', d: 'Papitas y queso', cat: 'per', e: '🌭', price: 15000, r: { pan_p: 1, salch: 1, queso: 2, papa: 1, sals: 1 } },
  // Salchipapas
  { id: 's1', name: 'Salchipapa personal', cat: 'sal', e: '🍟', price: 12000, r: { papa: 1, salch: 1, queso: 1, sals: 1 } },
  { id: 's3', name: 'Salchipapa con pollo', cat: 'sal', e: '🍟', price: 18000, r: { papa: 1, salch: 1, pollo: 1, queso: 1, sals: 1 } },
  { id: 's2', name: 'Salchipapa Gracia', d: 'Familiar · tocineta y huevo', cat: 'sal', e: '🍟', price: 26000, r: { papa: 3, salch: 2, queso: 2, toc: 2, huevo: 2, sals: 1 } },
  // Pollo
  { id: 'c1', name: 'Pollo apanado con papas', cat: 'pol', e: '🍗', price: 18000, r: { pollo: 1, papa: 1, sals: 1 } },
  { id: 'c3', name: 'Alitas x6', d: 'Con salsa BBQ y papas', cat: 'pol', e: '🍗', price: 21000, r: { pollo: 2, papa: 1, sals: 1 } },
  { id: 'c2', name: 'Pollo broaster', d: '2 presas con papas', cat: 'pol', e: '🍗', price: 27000, r: { pollo: 2, papa: 2, sals: 1 } },
  // Criollos
  { id: 'cr3', name: 'Arepa de huevo', cat: 'cri', e: '🫓', price: 5000, r: { masa: 1, huevo: 1 } },
  { id: 'cr4', name: 'Arepa rellena', d: 'Desmechado y queso', cat: 'cri', e: '🫓', price: 9500, r: { masa: 1, desm: 1, queso: 1 } },
  { id: 'cr1', name: 'Patacón relleno', d: 'Pollo desmechado y suero costeño', cat: 'cri', e: '🥘', price: 15000, r: { plat: 2, desm: 1, queso: 1, suero: 1, sals: 1 } },
  { id: 'cr2', name: 'Patacón mixto', d: 'Desmechado, huevo y queso', cat: 'cri', e: '🥘', price: 17000, r: { plat: 2, desm: 1, huevo: 1, queso: 1, suero: 1, sals: 1 } },
  // Del mar
  { id: 'm1', name: 'Pescado frito', d: 'Filete con patacón y ensalada', cat: 'mar', e: '🐟', price: 28000, r: { pesc: 1, plat: 2, ens: 1, sals: 1 } },
  { id: 'm2', name: 'Camarones apanados', d: 'Con papas y ensalada', cat: 'mar', e: '🍤', price: 32000, r: { cam: 1, papa: 1, ens: 1, suero: 1, sals: 1 } },
  // Fritos
  { id: 'f1', name: 'Empanada de carne', cat: 'fri', e: '🥟', price: 3000, r: { masa: 1, rell: 1 } },
  { id: 'f2', name: 'Carimañola de queso', cat: 'fri', e: '🧆', price: 3500, r: { yuca: 1, queso: 1 } },
  { id: 'f3', name: 'Deditos de queso x4', cat: 'fri', e: '🧀', price: 6000, r: { queso: 2, masa: 1 } },
  // Bebidas
  { id: 'b1', name: 'Jugo natural en agua', cat: 'beb', e: '🍹', price: 6000, r: { fruta: 1 } },
  { id: 'b5', name: 'Jugo natural en leche', cat: 'beb', e: '🥛', price: 7500, r: { fruta: 1, leche: 1 } },
  { id: 'b2', name: 'Limonada de coco', cat: 'beb', e: '🥥', price: 7000, r: { coco: 1 } },
  { id: 'b6', name: 'Avena fría', cat: 'beb', e: '🥛', price: 4500, r: { avena: 1 } },
  { id: 'b3', name: 'Gaseosa', cat: 'beb', e: '🥤', price: 4000, r: { gas: 1 } },
  { id: 'b4', name: 'Agua en botella', cat: 'beb', e: '💧', price: 3000, r: { agua: 1 } }
];

const NOTES = ['Sin cebolla', 'Sin suero costeño', 'Sin picante', 'Bien cocido', 'Salsas aparte', 'Con limón'];
