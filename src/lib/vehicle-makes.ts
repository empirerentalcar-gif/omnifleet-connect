// Vehicle makes and common models used in the agency vehicle listing form.
// Sorted alphabetically. Each list ends with an "Other" sentinel handled by the UI.

export const VEHICLE_MAKES_MODELS: Record<string, string[]> = {
  Acura: ["ILX", "Integra", "MDX", "RDX", "TLX", "TSX"],
  Audi: ["A3", "A4", "A5", "A6", "A7", "A8", "Q3", "Q5", "Q7", "Q8", "e-tron"],
  BMW: ["2 Series", "3 Series", "4 Series", "5 Series", "7 Series", "X1", "X3", "X5", "X7", "i4"],
  Buick: ["Enclave", "Encore", "Envision", "LaCrosse", "Regal"],
  Cadillac: ["ATS", "CT4", "CT5", "CTS", "Escalade", "XT4", "XT5", "XT6"],
  Chevrolet: ["Blazer", "Camaro", "Colorado", "Corvette", "Cruze", "Equinox", "Impala", "Malibu", "Silverado 1500", "Suburban", "Tahoe", "Traverse", "Trax"],
  Chrysler: ["300", "Pacifica", "Voyager"],
  Dodge: ["Challenger", "Charger", "Durango", "Grand Caravan", "Journey"],
  Ferrari: ["488", "California", "F8", "Portofino", "Roma"],
  Fiat: ["500", "500X", "500L"],
  Ford: ["Bronco", "Edge", "Escape", "Expedition", "Explorer", "F-150", "F-250", "Fusion", "Mustang", "Ranger", "Transit"],
  Genesis: ["G70", "G80", "G90", "GV70", "GV80"],
  GMC: ["Acadia", "Canyon", "Sierra 1500", "Terrain", "Yukon"],
  Honda: ["Accord", "Civic", "CR-V", "HR-V", "Odyssey", "Passport", "Pilot", "Ridgeline"],
  Hyundai: ["Accent", "Elantra", "Kona", "Palisade", "Santa Fe", "Sonata", "Tucson", "Venue"],
  Infiniti: ["Q50", "Q60", "QX50", "QX60", "QX80"],
  Jaguar: ["E-Pace", "F-Pace", "F-Type", "I-Pace", "XE", "XF"],
  Jeep: ["Cherokee", "Compass", "Gladiator", "Grand Cherokee", "Renegade", "Wagoneer", "Wrangler"],
  Kia: ["Forte", "K5", "Optima", "Rio", "Sorento", "Soul", "Sportage", "Telluride"],
  Lamborghini: ["Aventador", "Huracán", "Urus"],
  "Land Rover": ["Defender", "Discovery", "Discovery Sport", "Range Rover", "Range Rover Evoque", "Range Rover Sport", "Range Rover Velar"],
  Lexus: ["ES", "GS", "GX", "IS", "LS", "LX", "NX", "RX", "UX"],
  Lincoln: ["Aviator", "Corsair", "MKC", "MKX", "MKZ", "Nautilus", "Navigator"],
  Maserati: ["Ghibli", "GranTurismo", "Levante", "Quattroporte"],
  Mazda: ["CX-3", "CX-30", "CX-5", "CX-9", "Mazda3", "Mazda6", "MX-5 Miata"],
  "Mercedes-Benz": ["A-Class", "C-Class", "CLA", "E-Class", "G-Class", "GLA", "GLB", "GLC", "GLE", "GLS", "S-Class", "Sprinter"],
  MINI: ["Clubman", "Convertible", "Cooper", "Countryman", "Hardtop"],
  Mitsubishi: ["Eclipse Cross", "Mirage", "Outlander", "Outlander Sport"],
  Nissan: ["Altima", "Armada", "Frontier", "Kicks", "Maxima", "Murano", "Pathfinder", "Rogue", "Sentra", "Titan", "Versa"],
  Porsche: ["911", "Cayenne", "Macan", "Panamera", "Taycan"],
  Ram: ["1500", "2500", "3500", "ProMaster"],
  "Rolls-Royce": ["Cullinan", "Dawn", "Ghost", "Phantom", "Wraith"],
  Subaru: ["Ascent", "Crosstrek", "Forester", "Impreza", "Legacy", "Outback", "WRX"],
  Tesla: ["Cybertruck", "Model 3", "Model S", "Model X", "Model Y"],
  Toyota: ["4Runner", "Avalon", "Camry", "Corolla", "Highlander", "Land Cruiser", "Prius", "RAV4", "Sequoia", "Sienna", "Tacoma", "Tundra"],
  Volkswagen: ["Atlas", "Atlas Cross Sport", "Golf", "ID.4", "Jetta", "Passat", "Taos", "Tiguan"],
  Volvo: ["S60", "S90", "V60", "V90", "XC40", "XC60", "XC90"],
};

export const VEHICLE_MAKES = Object.keys(VEHICLE_MAKES_MODELS).sort((a, b) =>
  a.localeCompare(b)
);

export const VEHICLE_YEARS: number[] = (() => {
  const current = new Date().getFullYear();
  const years: number[] = [];
  for (let y = current; y >= 2000; y--) years.push(y);
  return years;
})();

export const OTHER_MODEL = "__OTHER__";
