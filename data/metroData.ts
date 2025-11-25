import { MetroData, StationRarity } from '../types';

/**
 * ==========================================
 * 🛠️ DATA EDITOR: EDIT METRO LINES HERE
 * ==========================================
 * Instructions:
 * 1. Station names must match EXACTLY across lines for transfers to work.
 * 2. Order matters! (First station is index 0).
 * 3. To fix a direction label, edit the "directions" object.
 */

export const METRO_DATA: MetroData = {
    lines: {
        "1": ["Pinar de Chamartín", "Bambú", "Chamartín", "Plaza de Castilla", "Valdeacederas", "Tetuán", "Estrecho", "Alvarado", "Cuatro Caminos", "Ríos Rosas", "Iglesia", "Bilbao", "Tribunal", "Gran Vía", "Sol", "Tirso de Molina", "Antón Martín", "Atocha", "Menéndez Pelayo", "Pacífico", "Puente de Vallecas", "Nueva Numancia", "Portazgo", "Buenos Aires", "Alto del Arenal", "Miguel Hernández", "Sierra de Guadalupe", "Villa de Vallecas", "Congosto", "La Gavia", "Las Suertes", "Valdecarros"],
        
        "2": ["Las Rosas", "Avenida de Guadalajara", "Alsacia", "La Almudena", "La Elipa", "Ventas", "Manuel Becerra", "Goya", "Príncipe de Vergara", "Retiro", "Banco de España", "Sevilla", "Sol", "Ópera", "Santo Domingo", "Noviciado", "San Bernardo", "Quevedo", "Canal", "Cuatro Caminos"],
        
        "3": ["El Casar", "Los Espartales", "Villaverde Alto", "San Cristóbal", "Villaverde Bajo-Cruce", "Ciudad de los Ángeles", "San Fermín-Orcasur", "Hospital 12 de Octubre", "Almendrales", "Legazpi", "Delicias", "Palos de la Frontera", "Embajadores", "Lavapiés", "Sol", "Callao", "Plaza de España", "Ventura Rodríguez", "Argüelles", "Moncloa"],
        
        "4": ["Argüelles", "San Bernardo", "Bilbao", "Alonso Martínez", "Colón", "Serrano", "Velázquez", "Goya", "Lista", "Diego de León", "Avenida de América", "Prosperidad", "Alfonso XIII", "Avenida de la Paz", "Arturo Soria", "Esperanza", "Canillas", "Mar de Cristal", "San Lorenzo", "Parque de Santa María", "Hortaleza", "Manoteras", "Pinar de Chamartín"],

        "5": ["Alameda de Osuna", "El Capricho", "Canillejas", "Torre Arias", "Suanzes", "Ciudad Lineal", "Pueblo Nuevo", "Quintana", "El Carmen", "Ventas", "Diego de León", "Núñez de Balboa", "Rubén Darío", "Alonso Martínez", "Chueca", "Gran Vía", "Callao", "Ópera", "La Latina", "Puerta de Toledo", "Acacias", "Pirámides", "Marqués de Vadillo", "Urgel", "Oporto", "Vista Alegre", "Carabanchel", "Eugenia de Montijo", "Aluche", "Empalme", "Campamento", "Casa de Campo"],

        "6": ["Laguna", "Carpetana", "Oporto", "Opañel", "Plaza Elíptica", "Usera", "Legazpi", "Arganzuela-Planetario", "Méndez Álvaro", "Pacífico", "Conde de Casal", "Sainz de Baranda", "O'Donnell", "Manuel Becerra", "Diego de León", "Avenida de América", "República Argentina", "Nuevos Ministerios", "Cuatro Caminos", "Guzmán el Bueno", "Metropolitano", "Ciudad Universitaria", "Moncloa", "Argüelles", "Príncipe Pío", "Puerta del Ángel", "Alto de Extremadura", "Lucero"], 

        "7": ["Hospital del Henares", "Henares", "Jarama", "San Fernando", "La Rambla", "Coslada Central", "Barrio del Puerto", "Estadio Metropolitano", "Las Musas", "San Blas", "Simancas", "García Noblejas", "Ascao", "Pueblo Nuevo", "Barrio de la Concepción", "Parque de las Avenidas", "Cartagena", "Avenida de América", "Gregorio Marañón", "Alonso Cano", "Canal", "Islas Filipinas", "Guzmán el Bueno", "Francos Rodríguez", "Valdezarza", "Antonio Machado", "Peñagrande", "Avenida de la Ilustración", "Lacoma", "Arroyofresno", "Pitis"],

        "8": ["Nuevos Ministerios", "Colombia", "Pinar del Rey", "Mar de Cristal", "Feria de Madrid", "Aeropuerto T1-T2-T3", "Barajas", "Aeropuerto T4"],

        "9": ["Paco de Lucía", "Mirasierra", "Herrera Oria", "Barrio del Pilar", "Ventilla", "Plaza de Castilla", "Duque de Pastrana", "Pio XII", "Colombia", "Concha Espina", "Cruz del Rayo", "Avenida de América", "Núñez de Balboa", "Príncipe de Vergara", "Ibiza", "Sainz de Baranda", "Estrella", "Vinateros", "Artilleros", "Pavones", "Valdebernardo", "Vicálvaro", "San Cipriano", "Puerta de Arganda", "Rivas-Urbanizaciones", "Rivas Futura", "Rivas-Vaciamadrid", "La Poveda", "Arganda del Rey"],

        "10": ["Hospital Infanta Sofía", "Reyes Católicos", "Baunatal", "Manuel de Falla", "Marqués de la Valdavia", "La Moraleja", "La Granja", "Ronda de la Comunicación", "Las Tablas", "Montecarmelo", "Tres Olivos", "Fuencarral", "Begoña", "Chamartín", "Plaza de Castilla", "Cuzco", "Santiago Bernabéu", "Nuevos Ministerios", "Gregorio Marañón", "Alonso Martínez", "Tribunal", "Plaza de España", "Príncipe Pío", "Lago", "Batán", "Casa de Campo", "Colonia Jardín", "Aviación Española", "Cuatro Vientos", "Joaquín Vilumbrales", "Puerta del Sur"],

        "11": ["Plaza Elíptica", "Abrantes", "Pan Bendito", "San Francisco", "Carabanchel Alto", "La Peseta", "La Fortuna"],

        "12": ["Puerta del Sur", "Parque Lisboa", "Alcorcón Central", "Parque Oeste", "Universidad Rey Juan Carlos", "Móstoles Central", "Pradillo", "Hospital de Móstoles", "Manuela Malasaña", "Loranca", "Hospital de Fuenlabrada", "Parque Europa", "Fuenlabrada Central", "Parque de los Estados", "Arroyo Culebro", "Conservatorio", "Alonso de Mendoza", "Getafe Central", "Juan de la Cierva", "El Casar", "Los Espartales", "El Bercial", "El Carrascal", "Julián Besteiro", "Casa del Reloj", "Hospital Severo Ochoa", "Leganés Central", "San Nicasio"],

        "R": ["Ópera", "Príncipe Pío"],

        // CERCANÍAS (Simplified Major Lines)
        "C-1": ["Príncipe Pío", "Pirámides", "Delicias", "Méndez Álvaro", "Atocha", "Recoletos", "Nuevos Ministerios", "Chamartín", "Fuente de la Mora", "Aeropuerto T4"],
        "C-2": ["Chamartín", "Nuevos Ministerios", "Recoletos", "Atocha", "Asamblea de Madrid-Entrevías", "El Pozo", "Vallecas", "Santa Eugenia", "Vicálvaro", "Coslada", "San Fernando"],
        "C-3": ["Chamartín", "Nuevos Ministerios", "Sol", "Atocha", "Villaverde Bajo", "San Cristóbal de los Ángeles", "San Cristóbal", "Getafe Industrial", "Pinto", "Valdemoro", "Ciempozuelos", "Aranjuez"],
        "C-4": ["Parla", "Getafe Centro", "Las Margaritas Universidad", "Villaverde Alto", "Villaverde Bajo", "Atocha", "Sol", "Nuevos Ministerios", "Chamartín", "Fuencarral", "Cantoblanco Universidad"],
        "C-5": ["Móstoles-El Soto", "Móstoles", "Las Retamas", "Alcorcón", "San José de Valderas", "Cuatro Vientos", "Las Águilas", "Fanjul", "Aluche", "Laguna", "Embajadores", "Atocha", "Méndez Álvaro", "Doce de Octubre", "Orcasitas", "Puente Alcocer", "Villaverde Alto"],
        "C-7": ["Alcalá de Henares", "Torrejón de Ardoz", "San Fernando", "Coslada", "Vicálvaro", "Santa Eugenia", "Vallecas", "El Pozo", "Asamblea de Madrid-Entrevías", "Atocha", "Recoletos", "Nuevos Ministerios", "Chamartín", "Ramón y Cajal", "Pitis", "Las Rozas", "Majadahonda", "El Barrial-Centro Comercial Pozuelo", "Pozuelo", "Aravaca", "Príncipe Pío"]
    },
    
    // CUSTOM DIRECTION OVERRIDES
    directions: {
        "6": { start: "Circular (Laguna/Lucero)", end: "Circular (Carpetana/Oporto)" },
        "12": { start: "Circular (CCW)", end: "Circular (CW)" }
    },

    // Visual styles for lines
    colors: {
        "1": { bg: "#0097D7", text: "white" },
        "2": { bg: "#FF0000", text: "white" },
        "3": { bg: "#FFD500", text: "#103f91" }, // Updated to Dark Blue
        "4": { bg: "#A65E2E", text: "white" },
        "5": { bg: "#97C43D", text: "white" },
        "6": { bg: "#999999", text: "white" },
        "7": { bg: "#F89435", text: "white" },
        "8": { bg: "#F58DB8", text: "black" },
        "9": { bg: "#A3238E", text: "white" },
        "10": { bg: "#002E6F", text: "white" },
        "11": { bg: "#00964D", text: "white" },
        "12": { bg: "#A19026", text: "white" },
        "R": { bg: "#FFFFFF", text: "#002E6F", border: "#002E6F" },
        
        // Cercanías Colors
        "C-1": { bg: "#65B2E8", text: "white" }, // Light Blue
        "C-2": { bg: "#00964E", text: "white" }, // Green
        "C-3": { bg: "#9E58A4", text: "white" }, // Purple
        "C-4": { bg: "#0055A4", text: "white" }, // Blue
        "C-5": { bg: "#FFCD00", text: "black" }, // Yellow
        "C-7": { bg: "#E3232C", text: "white" }, // Red
    }
};

export const STATION_RARITY: StationRarity = {
    // Hubs (Common)
    "Sol": 1, "Nuevos Ministerios": 1, "Moncloa": 1, "Príncipe Pío": 1, "Avenida de América": 1, "Atocha": 1, "Chamartín": 1,

    // Ends of lines / Far out (Rare)
    "Hospital del Henares": 4, "Pitis": 4, "Puerta del Sur": 3, "Valdecarros": 3, "Villaverde Alto": 3,
    "Aeropuerto T4": 4, "Casa de Campo": 3, "Pinar de Chamartín": 3, "Hospital Infanta Sofía": 4, "Arganda del Rey": 4,
    "La Fortuna": 4, "San Cristóbal": 3, "Laguna": 3, "Aranjuez": 5, "Móstoles-El Soto": 4, "Alcalá de Henares": 4
};