/* ==========================================================
   LA ALBA · Datos de la carta
   Edita aquí platos, precios y descripciones.
   - price: número (se muestra como "8,50 €")
   - base:  ron | ginebra | vodka | whisky | agave | otros | sin
   - icon:  cualquier emoji
   ========================================================== */
window.MENU_DATA = {
  spirits: [
    { id: 'ron',     label: 'Ron' },
    { id: 'ginebra', label: 'Ginebra' },
    { id: 'vodka',   label: 'Vodka' },
    { id: 'whisky',  label: 'Whisky' },
    { id: 'agave',   label: 'Tequila y mezcal' },
    { id: 'otros',   label: 'Otros' },
    { id: 'sin',     label: 'Sin alcohol' }
  ],

  categories: [
    {
      id: 'classic',
      title: 'Classic Cocktails',
      short: 'Clásicos',
      variant: 'classic',
      items: [
        { name: 'Daiquiri',          price: 8.5, base: 'ron',     icon: '🍸', desc: 'Ron blanco, lima, azúcar' },
        { name: 'Gin Tonic Clásico', price: 9.0, base: 'ginebra', icon: '🥂', desc: 'Ginebra, tónica premium, piel de limón' },
        { name: 'Old Fashioned',     price: 9.5, base: 'whisky',  icon: '🥃', desc: 'Bourbon, azúcar, angostura, piel de naranja' },
        { name: 'Dry Martini',       price: 9.5, base: 'ginebra', icon: '🍸', desc: 'Ginebra, vermut seco, oliva o piel de limón' },
        { name: 'Margarita',         price: 9.0, base: 'agave',   icon: '🍹', desc: 'Tequila, triple sec, lima' },
        { name: 'Mojito',            price: 8.5, base: 'ron',     icon: '🌿', desc: 'Ron blanco, lima, hierbabuena, azúcar, soda' },
        { name: 'Piña Colada',       price: 9.0, base: 'ron',     icon: '🍍', desc: 'Ron, piña, coco' },
        { name: 'Negroni',           price: 9.5, base: 'ginebra', icon: '🥃', desc: 'Ginebra, campari, vermut rojo' },
        { name: 'Whisky Sour',       price: 8.5, base: 'whisky',  icon: '🍋', desc: 'Whisky, limón, azúcar, clara de huevo (opcional)' },
        { name: 'Moscow Mule',       price: 9.0, base: 'vodka',   icon: '🫚', desc: 'Vodka, lima, ginger beer' },
        { name: 'Caipirinha',        price: 8.5, base: 'otros',   icon: '🍈', desc: 'Cachaça, lima, azúcar' },
        { name: 'Bloody Mary',       price: 9.5, base: 'vodka',   icon: '🍅', desc: 'Vodka, tomate, limón, especias, sal de apio' },
        { name: 'French 75',         price: 9.5, base: 'ginebra', icon: '🥂', desc: 'Ginebra, limón, azúcar, cava' },
        { name: 'Manhattan',         price: 9.5, base: 'whisky',  icon: '🥃', desc: 'Whisky de centeno, vermut rojo, angostura' },
        { name: 'Cosmopolitan',      price: 9.0, base: 'vodka',   icon: '🍸', desc: 'Vodka, triple sec, arándano, lima' },
        { name: "Dark 'n Stormy",    price: 9.0, base: 'ron',     icon: '⛈️', desc: 'Ron oscuro, lima, ginger beer' }
      ]
    },
    {
      id: 'signatures',
      title: 'Signatures',
      short: 'Signatures',
      variant: 'signature',
      items: [
        { name: 'Alba Spritz',       price: 9.5, base: 'otros',   icon: '🍊', desc: 'Aperitivo de naranja, cava, soda, romero' },
        { name: 'Vermut de la Casa', price: 8.5, base: 'otros',   icon: '🫒', desc: 'Vermut casero, soda, aceituna, twist de naranja' },
        { name: 'Café Martini',      price: 9.0, base: 'vodka',   icon: '☕', desc: 'Vodka, licor de café, espresso, vainilla' },
        { name: 'Brisa Verde',       price: 9.0, base: 'ginebra', icon: '🥒', desc: 'Ginebra, pepino, albahaca, lima, soda' },
        { name: 'Miel y Limón',      price: 9.0, base: 'whisky',  icon: '🍯', desc: 'Whisky, licor de miel, limón, jengibre' },
        { name: 'Higo del Alba',     price: 9.5, base: 'ron',     icon: '🫐', desc: 'Ron oscuro, higo, lima, bitter de cacao' },
        { name: 'Tomillo Collins',   price: 8.5, base: 'ginebra', icon: '🌱', desc: 'Ginebra, tomillo, limón, soda' },
        { name: 'Mandarina Sour',    price: 9.0, base: 'whisky',  icon: '🍊', desc: 'Bourbon, mandarina, limón, azúcar, clara' },
        { name: 'Picante y Salado',  price: 9.0, base: 'agave',   icon: '🌶️', desc: 'Tequila, lima, sirope de chile, sal ahumada' },
        { name: 'Ron de Barrica',    price: 9.5, base: 'ron',     icon: '🛢️', desc: 'Ron de añejo, vermut, amargo de naranja' },
        { name: 'Huerto de Manzana', price: 9.0, base: 'vodka',   icon: '🍏', desc: 'Vodka, manzana verde, limón, hierbaluisa' },
        { name: 'Lavanda Fizz',      price: 8.5, base: 'ginebra', icon: '💜', desc: 'Ginebra, lavanda, limón, soda' },
        { name: 'Alba Paloma',       price: 9.0, base: 'agave',   icon: '🍹', desc: 'Tequila, pomelo rosa, lima, soda, sal' },
        { name: 'Mezcalina',         price: 9.5, base: 'agave',   icon: '🌵', desc: 'Mezcal, piña, lima, agave, sal de gusano (opcional)' }
      ]
    },
    {
      id: 'zero',
      title: 'Zero-Proof',
      short: 'Zero-Proof',
      variant: 'zero',
      items: [
        { name: 'Amanecer Verde',    price: 6.5, base: 'sin', icon: '🥬', desc: 'Pepino, manzana, lima, hierbabuena, soda' },
        { name: 'Cítrico & Tónica',  price: 6.0, base: 'sin', icon: '🍊', desc: 'Pomelo, naranja, especias, tónica' },
        { name: 'Bosque Rojo',       price: 6.5, base: 'sin', icon: '🍓', desc: 'Frutos rojos, hibisco, limón, soda' },
        { name: 'Ginger Beer Casero',price: 5.5, base: 'sin', icon: '🫚', desc: 'Jengibre, lima, miel, soda' },
        { name: 'Lavanda Limonada',  price: 6.0, base: 'sin', icon: '💐', desc: 'Lavanda, limón, sirope de agave, soda' },
        { name: 'Piña y Albahaca',   price: 6.0, base: 'sin', icon: '🍍', desc: 'Piña, albahaca, lima, soda' },
        { name: 'Coco & Lima',       price: 6.0, base: 'sin', icon: '🥥', desc: 'Coco, lima, sirope de vainilla, soda' },
        { name: 'Cold Brew Tonic',   price: 6.0, base: 'sin', icon: '🧊', desc: 'Café cold brew, tónica, piel de naranja' }
      ]
    }
  ]
};
