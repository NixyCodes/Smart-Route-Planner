// ══════════════════════════════════════════════════════════════
//  SkyRoute – Flight Data
// ══════════════════════════════════════════════════════════════

const AIRPORTS = [
    // [id, name, airport, lat, lng, type, country, region]
    ["JFK", "New York", "John F. Kennedy International", 40.6413, -73.7781, "hub", "USA", "North America"],
    ["LAX", "Los Angeles", "Los Angeles International", 33.9416, -118.4085, "hub", "USA", "North America"],
    ["ORD", "Chicago", "O'Hare International", 41.9742, -87.9073, "hub", "USA", "North America"],
    ["ATL", "Atlanta", "Hartsfield-Jackson Atlanta International", 33.6407, -84.4277, "hub", "USA", "North America"],
    ["DFW", "Dallas", "Dallas/Fort Worth International", 32.8998, -97.0403, "hub", "USA", "North America"],
    ["SFO", "San Francisco", "San Francisco International", 37.6213, -122.3790, "national", "USA", "North America"],
    ["MIA", "Miami", "Miami International Airport", 25.7959, -80.2870, "national", "USA", "North America"],
    ["BOS", "Boston", "Logan International Airport", 42.3656, -71.0096, "national", "USA", "North America"],
    ["DEN", "Denver", "Denver International Airport", 39.8561, -104.6737, "national", "USA", "North America"],
    ["SEA", "Seattle", "Seattle-Tacoma International", 47.4502, -122.3088, "national", "USA", "North America"],
    ["YYZ", "Toronto", "Pearson International Airport", 43.6777, -79.6248, "international", "Canada", "North America"],
    ["YVR", "Vancouver", "Vancouver International Airport", 49.1947, -123.1792, "national", "Canada", "North America"],
    ["YUL", "Montreal", "Montréal-Trudeau International", 45.4706, -73.7408, "national", "Canada", "North America"],
    ["MEX", "Mexico City", "Benito Juárez International", 19.4363, -99.0721, "international", "Mexico", "North America"],
    ["GRU", "São Paulo", "Guarulhos International Airport", -23.4356, -46.4731, "hub", "Brazil", "South America"],
    ["LHR", "London", "Heathrow Airport", 51.4700, -0.4543, "hub", "UK", "Europe"],
    ["EDI", "Edinburgh", "Edinburgh Airport", 55.9500, -3.3725, "national", "UK", "Europe"],
    ["MAN", "Manchester", "Manchester Airport", 53.3537, -2.2750, "national", "UK", "Europe"],
    ["CDG", "Paris", "Charles de Gaulle Airport", 49.0097, 2.5479, "hub", "France", "Europe"],
    ["FRA", "Frankfurt", "Frankfurt Airport", 50.0379, 8.5622, "hub", "Germany", "Europe"],
    ["AMS", "Amsterdam", "Amsterdam Airport Schiphol", 52.3086, 4.7639, "international", "Netherlands", "Europe"],
    ["MAD", "Madrid", "Adolfo Suárez Madrid-Barajas", 40.4983, -3.5676, "international", "Spain", "Europe"],
    ["FCO", "Rome", "Leonardo da Vinci International", 41.8045, 12.2508, "international", "Italy", "Europe"],
    ["IST", "Istanbul", "Istanbul Airport", 41.2608, 28.7418, "hub", "Turkey", "Europe"],
    ["MUC", "Munich", "Munich Airport", 48.3538, 11.7861, "national", "Germany", "Europe"],
    ["BER", "Berlin", "Berlin Brandenburg Airport", 52.3667, 13.5033, "national", "Germany", "Europe"],
    ["DXB", "Dubai", "Dubai International Airport", 25.2532, 55.3657, "hub", "UAE", "Middle East"],
    ["DOH", "Doha", "Hamad International Airport", 25.2731, 51.6080, "hub", "Qatar", "Middle East"],
    ["JNB", "Johannesburg", "O.R. Tambo International", -26.1392, 28.2460, "international", "South Africa", "Africa"],
    ["NRT", "Tokyo", "Narita International Airport", 35.7720, 140.3929, "hub", "Japan", "Asia"],
    ["ICN", "Seoul", "Incheon International Airport", 37.4602, 126.4407, "hub", "South Korea", "Asia"],
    ["HKG", "Hong Kong", "Hong Kong International Airport", 22.3080, 113.9185, "hub", "China SAR", "Asia"],
    ["PEK", "Beijing", "Capital International Airport", 40.0799, 116.6031, "hub", "China", "Asia"],
    ["SIN", "Singapore", "Changi Airport", 1.3644, 103.9915, "hub", "Singapore", "Asia"],
    ["BKK", "Bangkok", "Suvarnabhumi Airport", 13.6900, 100.7501, "hub", "Thailand", "Asia"],
    ["KUL", "Kuala Lumpur", "Kuala Lumpur International", 2.7456, 101.7099, "international", "Malaysia", "Asia"],
    ["CGK", "Jakarta", "Soekarno-Hatta International", -6.1275, 106.6537, "international", "Indonesia", "Asia"],
    ["BOM", "Mumbai", "Chhatrapati Shivaji Maharaj International", 19.0896, 72.8656, "hub", "India", "Asia"],
    ["DEL", "Delhi", "Indira Gandhi International Airport", 28.5665, 77.1031, "hub", "India", "Asia"],
    ["BLR", "Bangalore", "Kempegowda International Airport", 13.1979, 77.7063, "national", "India", "Asia"],
    ["HYD", "Hyderabad", "Rajiv Gandhi International Airport", 17.2403, 78.4294, "national", "India", "Asia"],
    ["MAA", "Chennai", "Chennai International Airport", 12.9941, 80.1709, "national", "India", "Asia"],
    ["CCU", "Kolkata", "Netaji Subhas Chandra Bose International", 22.6547, 88.4467, "national", "India", "Asia"],
    ["SYD", "Sydney", "Kingsford Smith Airport", -33.9399, 151.1753, "hub", "Australia", "Oceania"],
    ["MEL", "Melbourne", "Melbourne Airport (Tullamarine)", -37.6690, 144.8410, "national", "Australia", "Oceania"],
    ["BNE", "Brisbane", "Brisbane Airport", -27.3842, 153.1175, "national", "Australia", "Oceania"],
    ["PER", "Perth", "Perth Airport", -31.9403, 115.9674, "national", "Australia", "Oceania"],
];

const AIRLINES = [
    ["EK", "Emirates"], ["DL", "Delta Air Lines"], ["UA", "United Airlines"],
    ["AA", "American Airlines"], ["BA", "British Airways"], ["AF", "Air France"],
    ["LH", "Lufthansa"], ["SQ", "Singapore Airlines"], ["QF", "Qantas Airways"],
    ["QR", "Qatar Airways"], ["CX", "Cathay Pacific"], ["TK", "Turkish Airlines"],
    ["AI", "Air India"], ["6E", "IndiGo"], ["AK", "AirAsia"],
    ["AC", "Air Canada"], ["VA", "Virgin Australia"], ["CA", "Air China"],
];

const AIRCRAFT = [
    ["B777", "Boeing 777-300ER"], ["B787", "Boeing 787-9 Dreamliner"],
    ["A380", "Airbus A380-800"], ["A350", "Airbus A350-900"],
    ["B747", "Boeing 747-400"], ["A320", "Airbus A320neo"],
    ["B737", "Boeing 737-800"], ["A321", "Airbus A321neo"],
];

// [id, from, to, dist_km, time_min, cost_usd, airline, aircraft]
const RAW_SEGMENTS = [
    ["FS001", "JFK", "LHR", 5539, 420, 820, "BA", "B777"], ["FS002", "LHR", "JFK", 5539, 420, 820, "BA", "B777"],
    ["FS003", "JFK", "CDG", 5837, 450, 790, "AF", "A350"], ["FS004", "CDG", "JFK", 5837, 450, 790, "AF", "A350"],
    ["FS005", "JFK", "ORD", 1200, 150, 220, "UA", "A320"], ["FS006", "ORD", "JFK", 1200, 150, 220, "UA", "A320"],
    ["FS007", "JFK", "LAX", 3983, 330, 350, "DL", "B787"], ["FS008", "LAX", "JFK", 3983, 330, 350, "DL", "B787"],
    ["FS009", "LHR", "DXB", 5508, 405, 680, "EK", "A380"], ["FS010", "DXB", "LHR", 5508, 405, 680, "EK", "A380"],
    ["FS011", "DXB", "SIN", 5840, 420, 590, "EK", "A380"], ["FS012", "SIN", "DXB", 5840, 420, 590, "EK", "A380"],
    ["FS013", "SIN", "NRT", 5312, 390, 510, "SQ", "A350"], ["FS014", "NRT", "SIN", 5312, 390, 510, "SQ", "A350"],
    ["FS015", "SIN", "SYD", 6307, 465, 550, "QF", "B787"], ["FS016", "SYD", "SIN", 6307, 465, 550, "QF", "B787"],
    ["FS017", "DXB", "BOM", 1940, 210, 310, "EK", "B777"], ["FS018", "BOM", "DXB", 1940, 210, 310, "EK", "B777"],
    ["FS019", "LHR", "FRA", 651, 110, 180, "LH", "A320"], ["FS020", "FRA", "LHR", 651, 110, 180, "LH", "A320"],
    ["FS021", "CDG", "FRA", 478, 90, 150, "AF", "A320"], ["FS022", "FRA", "CDG", 478, 90, 150, "AF", "A320"],
    ["FS023", "JFK", "YYZ", 567, 90, 160, "AC", "A320"], ["FS024", "YYZ", "JFK", 567, 90, 160, "AC", "A320"],
    ["FS025", "LAX", "MEX", 2478, 210, 290, "AA", "A321"], ["FS026", "MEX", "LAX", 2478, 210, 290, "AA", "A321"],
    ["FS027", "LAX", "NRT", 8767, 600, 780, "UA", "B777"], ["FS028", "NRT", "LAX", 8767, 600, 780, "UA", "B777"],
    ["FS029", "GRU", "LHR", 9469, 690, 890, "BA", "B777"], ["FS030", "LHR", "GRU", 9469, 690, 890, "BA", "B777"],
    ["FS031", "ICN", "NRT", 1213, 130, 190, "SQ", "A321"], ["FS032", "NRT", "ICN", 1213, 130, 190, "SQ", "A321"],
    ["FS033", "BOM", "SIN", 4144, 330, 420, "SQ", "A350"], ["FS034", "SIN", "BOM", 4144, 330, 420, "SQ", "A350"],
    ["FS035", "FRA", "DXB", 4922, 375, 570, "EK", "A380"], ["FS036", "DXB", "FRA", 4922, 375, 570, "EK", "A380"],
    ["FS037", "ORD", "LAX", 2801, 240, 280, "UA", "B787"], ["FS038", "LAX", "ORD", 2801, 240, 280, "UA", "B787"],
    ["FS039", "YYZ", "LHR", 5718, 435, 760, "BA", "B787"], ["FS040", "LHR", "YYZ", 5718, 435, 760, "BA", "B787"],
    ["FS041", "SYD", "LAX", 12074, 825, 1150, "QF", "A380"], ["FS042", "LAX", "SYD", 12074, 825, 1150, "QF", "A380"],
    ["FS043", "ICN", "SIN", 4697, 360, 480, "SQ", "A350"], ["FS044", "SIN", "ICN", 4697, 360, 480, "SQ", "A350"],
    // USA Domestic
    ["FS045", "ATL", "JFK", 1229, 155, 175, "DL", "B737"], ["FS046", "JFK", "ATL", 1229, 155, 175, "DL", "B737"],
    ["FS047", "ATL", "ORD", 975, 130, 155, "DL", "B737"], ["FS048", "ORD", "ATL", 975, 130, 155, "DL", "B737"],
    ["FS049", "ATL", "LAX", 3118, 265, 290, "DL", "A321"], ["FS050", "LAX", "ATL", 3118, 265, 290, "DL", "A321"],
    ["FS051", "ATL", "DFW", 1146, 145, 160, "AA", "B737"], ["FS052", "DFW", "ATL", 1146, 145, 160, "AA", "B737"],
    ["FS053", "ATL", "MIA", 1092, 140, 150, "AA", "B737"], ["FS054", "MIA", "ATL", 1092, 140, 150, "AA", "B737"],
    ["FS055", "DFW", "LAX", 1987, 185, 225, "AA", "A321"], ["FS056", "LAX", "DFW", 1987, 185, 225, "AA", "A321"],
    ["FS057", "DFW", "ORD", 1292, 165, 185, "AA", "B737"], ["FS058", "ORD", "DFW", 1292, 165, 185, "AA", "B737"],
    ["FS059", "SFO", "LAX", 559, 80, 115, "UA", "B737"], ["FS060", "LAX", "SFO", 559, 80, 115, "UA", "B737"],
    ["FS061", "SFO", "SEA", 1093, 135, 155, "UA", "B737"], ["FS062", "SEA", "SFO", 1093, 135, 155, "UA", "B737"],
    ["FS063", "SFO", "JFK", 4145, 340, 355, "UA", "B787"], ["FS064", "JFK", "SFO", 4145, 340, 355, "UA", "B787"],
    ["FS065", "BOS", "JFK", 306, 65, 115, "UA", "A320"], ["FS066", "JFK", "BOS", 306, 65, 115, "UA", "A320"],
    ["FS067", "BOS", "ORD", 1551, 165, 190, "AA", "A320"], ["FS068", "ORD", "BOS", 1551, 165, 190, "AA", "A320"],
    ["FS069", "DEN", "LAX", 1399, 160, 180, "UA", "B737"], ["FS070", "LAX", "DEN", 1399, 160, 180, "UA", "B737"],
    ["FS071", "DEN", "ORD", 1464, 170, 190, "UA", "B737"], ["FS072", "ORD", "DEN", 1464, 170, 190, "UA", "B737"],
    ["FS073", "SEA", "LAX", 1535, 170, 195, "UA", "B737"], ["FS074", "LAX", "SEA", 1535, 170, 195, "UA", "B737"],
    ["FS075", "MIA", "JFK", 1757, 185, 210, "AA", "A321"], ["FS076", "JFK", "MIA", 1757, 185, 210, "AA", "A321"],
    // USA International
    ["FS077", "ATL", "LHR", 7084, 540, 860, "DL", "A350"], ["FS078", "LHR", "ATL", 7084, 540, 860, "DL", "A350"],
    ["FS079", "MIA", "GRU", 7592, 575, 820, "AA", "B777"], ["FS080", "GRU", "MIA", 7592, 575, 820, "AA", "B777"],
    ["FS081", "BOS", "LHR", 5265, 410, 745, "BA", "B787"], ["FS082", "LHR", "BOS", 5265, 410, 745, "BA", "B787"],
    ["FS083", "SFO", "NRT", 8277, 570, 810, "UA", "B777"], ["FS084", "NRT", "SFO", 8277, 570, 810, "UA", "B777"],
    ["FS085", "DFW", "LHR", 7640, 575, 870, "AA", "B777"], ["FS086", "LHR", "DFW", 7640, 575, 870, "AA", "B777"],
    ["FS087", "MIA", "MEX", 1306, 155, 185, "AA", "A320"], ["FS088", "MEX", "MIA", 1306, 155, 185, "AA", "A320"],
    // Canada
    ["FS089", "YVR", "YYZ", 3346, 270, 310, "AC", "B787"], ["FS090", "YYZ", "YVR", 3346, 270, 310, "AC", "B787"],
    ["FS091", "YVR", "LAX", 1736, 185, 215, "AC", "A320"], ["FS092", "LAX", "YVR", 1736, 185, 215, "AC", "A320"],
    ["FS093", "YUL", "YYZ", 541, 85, 120, "AC", "A320"], ["FS094", "YYZ", "YUL", 541, 85, 120, "AC", "A320"],
    ["FS095", "YUL", "LHR", 5228, 405, 725, "AC", "B787"], ["FS096", "LHR", "YUL", 5228, 405, 725, "AC", "B787"],
    // UK National
    ["FS097", "LHR", "EDI", 534, 80, 100, "BA", "A320"], ["FS098", "EDI", "LHR", 534, 80, 100, "BA", "A320"],
    ["FS099", "LHR", "MAN", 262, 65, 80, "BA", "A320"], ["FS100", "MAN", "LHR", 262, 65, 80, "BA", "A320"],
    ["FS101", "EDI", "MAN", 320, 70, 90, "BA", "A320"], ["FS102", "MAN", "EDI", 320, 70, 90, "BA", "A320"],
    // European
    ["FS103", "LHR", "AMS", 370, 75, 120, "BA", "A320"], ["FS104", "AMS", "LHR", 370, 75, 120, "BA", "A320"],
    ["FS105", "LHR", "MAD", 1265, 140, 165, "BA", "A321"], ["FS106", "MAD", "LHR", 1265, 140, 165, "BA", "A321"],
    ["FS107", "LHR", "FCO", 1435, 155, 175, "BA", "A321"], ["FS108", "FCO", "LHR", 1435, 155, 175, "BA", "A321"],
    ["FS109", "CDG", "AMS", 430, 80, 115, "AF", "A320"], ["FS110", "AMS", "CDG", 430, 80, 115, "AF", "A320"],
    ["FS111", "CDG", "MAD", 1052, 125, 145, "AF", "A320"], ["FS112", "MAD", "CDG", 1052, 125, 145, "AF", "A320"],
    ["FS113", "CDG", "FCO", 1107, 130, 150, "AF", "A320"], ["FS114", "FCO", "CDG", 1107, 130, 150, "AF", "A320"],
    ["FS115", "FRA", "AMS", 370, 75, 110, "LH", "A320"], ["FS116", "AMS", "FRA", 370, 75, 110, "LH", "A320"],
    ["FS117", "FRA", "MUC", 305, 70, 95, "LH", "A320"], ["FS118", "MUC", "FRA", 305, 70, 95, "LH", "A320"],
    ["FS119", "FRA", "BER", 554, 90, 105, "LH", "A320"], ["FS120", "BER", "FRA", 554, 90, 105, "LH", "A320"],
    ["FS121", "MUC", "BER", 504, 85, 100, "LH", "A320"], ["FS122", "BER", "MUC", 504, 85, 100, "LH", "A320"],
    ["FS123", "AMS", "MAD", 1461, 155, 170, "AF", "A321"], ["FS124", "MAD", "AMS", 1461, 155, 170, "AF", "A321"],
    ["FS125", "AMS", "FCO", 1304, 145, 160, "AF", "A321"], ["FS126", "FCO", "AMS", 1304, 145, 160, "AF", "A321"],
    ["FS127", "MAD", "GRU", 8365, 620, 780, "BA", "B787"], ["FS128", "GRU", "MAD", 8365, 620, 780, "BA", "B787"],
    // Istanbul Hub
    ["FS129", "IST", "LHR", 2514, 235, 320, "TK", "B787"], ["FS130", "LHR", "IST", 2514, 235, 320, "TK", "B787"],
    ["FS131", "IST", "CDG", 2238, 220, 300, "TK", "B787"], ["FS132", "CDG", "IST", 2238, 220, 300, "TK", "B787"],
    ["FS133", "IST", "DXB", 3399, 285, 420, "TK", "A350"], ["FS134", "DXB", "IST", 3399, 285, 420, "TK", "A350"],
    ["FS135", "IST", "JFK", 8040, 605, 840, "TK", "B777"], ["FS136", "JFK", "IST", 8040, 605, 840, "TK", "B777"],
    ["FS137", "IST", "BOM", 4540, 355, 510, "TK", "B787"], ["FS138", "BOM", "IST", 4540, 355, 510, "TK", "B787"],
    // Middle East
    ["FS139", "DXB", "DOH", 360, 70, 120, "EK", "A320"], ["FS140", "DOH", "DXB", 360, 70, 120, "QR", "A320"],
    ["FS141", "DOH", "LHR", 5725, 435, 700, "QR", "A350"], ["FS142", "LHR", "DOH", 5725, 435, 700, "QR", "A350"],
    ["FS143", "DOH", "BOM", 2028, 220, 325, "QR", "B777"], ["FS144", "BOM", "DOH", 2028, 220, 325, "QR", "B777"],
    ["FS145", "DOH", "SIN", 5842, 440, 610, "QR", "A380"], ["FS146", "SIN", "DOH", 5842, 440, 610, "QR", "A380"],
    ["FS147", "DOH", "JFK", 11034, 795, 1050, "QR", "B777"], ["FS148", "JFK", "DOH", 11034, 795, 1050, "QR", "B777"],
    ["FS149", "DOH", "NRT", 7534, 565, 780, "QR", "B787"], ["FS150", "NRT", "DOH", 7534, 565, 780, "QR", "B787"],
    // Africa
    ["FS151", "JNB", "LHR", 9062, 665, 855, "BA", "B777"], ["FS152", "LHR", "JNB", 9062, 665, 855, "BA", "B777"],
    ["FS153", "JNB", "DXB", 7097, 545, 760, "EK", "A380"], ["FS154", "DXB", "JNB", 7097, 545, 760, "EK", "A380"],
    ["FS155", "JNB", "GRU", 7717, 590, 810, "BA", "B787"], ["FS156", "GRU", "JNB", 7717, 590, 810, "BA", "B787"],
    ["FS157", "JNB", "SIN", 9056, 660, 845, "SQ", "A350"], ["FS158", "SIN", "JNB", 9056, 660, 845, "SQ", "A350"],
    ["FS159", "JNB", "IST", 7838, 590, 800, "TK", "B787"], ["FS160", "IST", "JNB", 7838, 590, 800, "TK", "B787"],
    // East Asia
    ["FS161", "HKG", "SIN", 2575, 235, 335, "CX", "A350"], ["FS162", "SIN", "HKG", 2575, 235, 335, "CX", "A350"],
    ["FS163", "HKG", "NRT", 2903, 255, 355, "CX", "A350"], ["FS164", "NRT", "HKG", 2903, 255, 355, "CX", "A350"],
    ["FS165", "HKG", "PEK", 1973, 210, 285, "CA", "B737"], ["FS166", "PEK", "HKG", 1973, 210, 285, "CA", "B737"],
    ["FS167", "HKG", "ICN", 2094, 215, 295, "CX", "A321"], ["FS168", "ICN", "HKG", 2094, 215, 295, "CX", "A321"],
    ["FS169", "HKG", "LHR", 9641, 705, 870, "CX", "A350"], ["FS170", "LHR", "HKG", 9641, 705, 870, "CX", "A350"],
    ["FS171", "HKG", "SYD", 7382, 565, 720, "CX", "A350"], ["FS172", "SYD", "HKG", 7382, 565, 720, "CX", "A350"],
    ["FS173", "HKG", "BOM", 4188, 340, 440, "CX", "A350"], ["FS174", "BOM", "HKG", 4188, 340, 440, "CX", "A350"],
    ["FS175", "PEK", "ICN", 952, 125, 185, "CA", "B737"], ["FS176", "ICN", "PEK", 952, 125, 185, "CA", "B737"],
    ["FS177", "PEK", "LHR", 8147, 615, 830, "CA", "B777"], ["FS178", "LHR", "PEK", 8147, 615, 830, "CA", "B777"],
    ["FS179", "PEK", "SIN", 4476, 360, 495, "CA", "A350"], ["FS180", "SIN", "PEK", 4476, 360, 495, "CA", "A350"],
    ["FS181", "PEK", "NRT", 2096, 220, 295, "CA", "B737"], ["FS182", "NRT", "PEK", 2096, 220, 295, "CA", "B737"],
    ["FS183", "PEK", "JFK", 10989, 795, 1020, "CA", "B777"], ["FS184", "JFK", "PEK", 10989, 795, 1020, "CA", "B777"],
    // Southeast Asia
    ["FS185", "BKK", "SIN", 1438, 160, 215, "AK", "A320"], ["FS186", "SIN", "BKK", 1438, 160, 215, "AK", "A320"],
    ["FS187", "BKK", "NRT", 4588, 360, 485, "TK", "A350"], ["FS188", "NRT", "BKK", 4588, 360, 485, "TK", "A350"],
    ["FS189", "BKK", "DXB", 4919, 380, 515, "EK", "A380"], ["FS190", "DXB", "BKK", 4919, 380, 515, "EK", "A380"],
    ["FS191", "BKK", "HKG", 1741, 180, 245, "CX", "A321"], ["FS192", "HKG", "BKK", 1741, 180, 245, "CX", "A321"],
    ["FS193", "BKK", "SYD", 7543, 570, 730, "QF", "B787"], ["FS194", "SYD", "BKK", 7543, 570, 730, "QF", "B787"],
    ["FS195", "KUL", "SIN", 312, 65, 100, "AK", "A320"], ["FS196", "SIN", "KUL", 312, 65, 100, "AK", "A320"],
    ["FS197", "KUL", "BKK", 1172, 145, 175, "AK", "A320"], ["FS198", "BKK", "KUL", 1172, 145, 175, "AK", "A320"],
    ["FS199", "KUL", "SYD", 6583, 500, 640, "QF", "B787"], ["FS200", "SYD", "KUL", 6583, 500, 640, "QF", "B787"],
    ["FS201", "CGK", "SIN", 884, 115, 130, "AK", "A320"], ["FS202", "SIN", "CGK", 884, 115, 130, "AK", "A320"],
    ["FS203", "CGK", "KUL", 1088, 135, 155, "AK", "A320"], ["FS204", "KUL", "CGK", 1088, 135, 155, "AK", "A320"],
    ["FS205", "CGK", "BKK", 2279, 220, 285, "AK", "A321"], ["FS206", "BKK", "CGK", 2279, 220, 285, "AK", "A321"],
    ["FS207", "CGK", "SYD", 5522, 425, 580, "QF", "B787"], ["FS208", "SYD", "CGK", 5522, 425, 580, "QF", "B787"],
    // India International
    ["FS209", "DEL", "LHR", 6741, 525, 740, "AI", "B787"], ["FS210", "LHR", "DEL", 6741, 525, 740, "AI", "B787"],
    ["FS211", "DEL", "DXB", 2205, 225, 285, "AI", "B787"], ["FS212", "DXB", "DEL", 2205, 225, 285, "EK", "B777"],
    ["FS213", "DEL", "SIN", 4150, 335, 425, "SQ", "A350"], ["FS214", "SIN", "DEL", 4150, 335, 425, "SQ", "A350"],
    ["FS215", "DEL", "JFK", 11748, 855, 1080, "AI", "B777"], ["FS216", "JFK", "DEL", 11748, 855, 1080, "AI", "B777"],
    ["FS217", "BLR", "SIN", 3155, 270, 385, "SQ", "A321"], ["FS218", "SIN", "BLR", 3155, 270, 385, "SQ", "A321"],
    ["FS219", "BLR", "DXB", 2666, 260, 330, "EK", "B777"], ["FS220", "DXB", "BLR", 2666, 260, 330, "EK", "B777"],
    // India Domestic
    ["FS221", "DEL", "BOM", 1151, 135, 120, "6E", "A320"], ["FS222", "BOM", "DEL", 1151, 135, 120, "6E", "A320"],
    ["FS223", "DEL", "BLR", 1740, 175, 150, "6E", "A320"], ["FS224", "BLR", "DEL", 1740, 175, 150, "6E", "A320"],
    ["FS225", "DEL", "HYD", 1249, 145, 130, "6E", "A320"], ["FS226", "HYD", "DEL", 1249, 145, 130, "6E", "A320"],
    ["FS227", "DEL", "MAA", 2175, 210, 170, "6E", "A321"], ["FS228", "MAA", "DEL", 2175, 210, 170, "6E", "A321"],
    ["FS229", "DEL", "CCU", 1305, 150, 135, "6E", "A320"], ["FS230", "CCU", "DEL", 1305, 150, 135, "6E", "A320"],
    ["FS231", "BOM", "BLR", 841, 110, 100, "6E", "A320"], ["FS232", "BLR", "BOM", 841, 110, 100, "6E", "A320"],
    ["FS233", "BOM", "HYD", 621, 90, 85, "6E", "A320"], ["FS234", "HYD", "BOM", 621, 90, 85, "6E", "A320"],
    ["FS235", "BOM", "MAA", 1041, 125, 110, "6E", "A320"], ["FS236", "MAA", "BOM", 1041, 125, 110, "6E", "A320"],
    ["FS237", "BOM", "CCU", 1650, 170, 145, "6E", "A321"], ["FS238", "CCU", "BOM", 1650, 170, 145, "6E", "A321"],
    ["FS239", "BLR", "HYD", 492, 75, 75, "6E", "A320"], ["FS240", "HYD", "BLR", 492, 75, 75, "6E", "A320"],
    ["FS241", "BLR", "MAA", 290, 60, 65, "6E", "A320"], ["FS242", "MAA", "BLR", 290, 60, 65, "6E", "A320"],
    ["FS243", "BLR", "CCU", 1546, 165, 140, "6E", "A320"], ["FS244", "CCU", "BLR", 1546, 165, 140, "6E", "A320"],
    ["FS245", "HYD", "MAA", 624, 90, 85, "6E", "A320"], ["FS246", "MAA", "HYD", 624, 90, 85, "6E", "A320"],
    ["FS247", "CCU", "BKK", 1862, 185, 240, "AI", "A321"], ["FS248", "BKK", "CCU", 1862, 185, 240, "AI", "A321"],
    // Australia Domestic
    ["FS249", "SYD", "MEL", 714, 95, 130, "QF", "B737"], ["FS250", "MEL", "SYD", 714, 95, 130, "QF", "B737"],
    ["FS251", "SYD", "BNE", 924, 120, 145, "VA", "B737"], ["FS252", "BNE", "SYD", 924, 120, 145, "VA", "B737"],
    ["FS253", "SYD", "PER", 3290, 275, 300, "QF", "B737"], ["FS254", "PER", "SYD", 3290, 275, 300, "QF", "B737"],
    ["FS255", "MEL", "BNE", 1375, 155, 170, "VA", "B737"], ["FS256", "BNE", "MEL", 1375, 155, 170, "VA", "B737"],
    ["FS257", "MEL", "PER", 2697, 240, 275, "QF", "B737"], ["FS258", "PER", "MEL", 2697, 240, 275, "QF", "B737"],
    ["FS259", "MEL", "SIN", 6063, 460, 605, "SQ", "A350"], ["FS260", "SIN", "MEL", 6063, 460, 605, "SQ", "A350"],
    ["FS261", "PER", "SIN", 3893, 315, 420, "SQ", "A321"], ["FS262", "SIN", "PER", 3893, 315, 420, "SQ", "A321"],
    ["FS263", "BNE", "SIN", 6312, 475, 620, "SQ", "B787"], ["FS264", "SIN", "BNE", 6312, 475, 620, "SQ", "B787"],
];

// ── Derived maps for fast lookup ────────────────────────────────
const AIRPORT_MAP = Object.fromEntries(AIRPORTS.map(a => [a[0], {
    id: a[0], name: a[1], airport: a[2], lat: a[3], lng: a[4],
    type: a[5], country: a[6], region: a[7]
}]));

const AIRLINE_MAP = Object.fromEntries(AIRLINES.map(a => [a[0], { id: a[0], name: a[1] }]));
const AIRCRAFT_MAP = Object.fromEntries(AIRCRAFT.map(a => [a[0], { id: a[0], type: a[1] }]));

const SEGMENTS = RAW_SEGMENTS.map(s => ({
    id: s[0], from: s[1], to: s[2],
    distance: s[3], time: s[4], cost: s[5],
    airline: s[6], aircraft: s[7]
}));

const REGIONS = ["North America", "South America", "Europe", "Middle East", "Africa", "Asia", "Oceania"];

const POPULAR_ROUTES = [
    { from: "DEL", to: "BLR", label: "Delhi → Bangalore", tag: "National" },
    { from: "JFK", to: "SIN", label: "New York → Singapore", tag: "International" },
    { from: "LHR", to: "EDI", label: "London → Edinburgh", tag: "National" },
    { from: "SYD", to: "MEL", label: "Sydney → Melbourne", tag: "National" },
    { from: "BOM", to: "MAA", label: "Mumbai → Chennai", tag: "National" },
    { from: "ATL", to: "LAX", label: "Atlanta → LA", tag: "Domestic" },
    { from: "FRA", to: "MUC", label: "Frankfurt → Munich", tag: "National" },
    { from: "HKG", to: "LHR", label: "Hong Kong → London", tag: "International" },
    { from: "DOH", to: "NRT", label: "Doha → Tokyo", tag: "International" },
];

module.exports = {
    AIRPORTS,
    AIRLINES,
    AIRCRAFT,
    RAW_SEGMENTS,
    AIRPORT_MAP,
    AIRLINE_MAP,
    AIRCRAFT_MAP,
    SEGMENTS
};
