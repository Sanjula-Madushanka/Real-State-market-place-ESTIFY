import React, { useState, useEffect } from 'react';

const ValuationTool = () => {
    // 100% Complete Sri Lankan District/Town Data
    const townData = {
        "Ampara": ["Ampara City", "Akkarepattu", "Kalmunai"],
        "Anuradhapura": ["Anuradhapura City", "Mihintale", "Nochchiyagama", "Eppawala"],
        "Badulla": ["Badulla City", "Bandarawela", "Welimada", "Haputale"],
        "Batticaloa": ["Batticaloa City"],
        "Colombo": ["Colombo 1", "Colombo 2", "Colombo 3", "Colombo 4", "Colombo 5", 
                   "Colombo 6", "Colombo 7", "Colombo 8", "Colombo 9", "Colombo 10",
                   "Colombo 12", "Colombo 13", "Colombo 14", "Colombo 15", "Dehiwala",
                   "Mount Lavinia", "Nugegoda", "Kohuwala", "Rajagiriya", "Wellampitiya"],
        "Galle": ["Galle City", "Ahangama", "Hikkaduwa", "Karapitiya", "Dikwella"],
        "Gampaha": ["Gampaha City", "Ja-Ela", "Ragama", "Kadawatha", "Kiribathgoda",
                   "Kelaniya", "Negombo", "Minuwangoda", "Divulapitiya", "Seeduwa", "Wattala"],
        "Hambantota": ["Hambantota City", "Tangalla", "Ambalantota", "Kataragama"],
        "Jaffna": ["Jaffna City", "Nallur"],
        "Kalutara": ["Kalutara City", "Beruwala", "Bandaragama", "Matugama", "Wadduwa"],
        "Kandy": ["Kandy City", "Peradeniya", "Katugastota", "Pilimatalawa",
                 "Gampola", "Gelioya", "Digana", "Menikhinna"],
        "Kegalle": ["Kegalle City", "Warakapola", "Rambukkana"],
        "Kurunegala": ["Kurunegala City", "Narammala", "Pannala", "Wariyapola", "Kuliyapitiya"],
        "Mannar": ["Mannar City"],
        "Matale": ["Matale City", "Galewela"],
        "Matara": ["Matara City", "Weligama", "Dikwella", "Mirissa", "Kamburugamuwa",
                  "Deniyaya", "Akuressa", "Devinuwara", "Kekanadura", "Thelijjawila",
                  "Pasgoda", "Urubokka", "Thihagoda", "Malimbada", "Hakmana", "Makandura"],
        "Monaragala": ["Monaragala City", "Wellawaya", "Bibile"],
        "Mullativu": ["Mullativu City"],
        "Nuwara Eliya": ["Nuwara Eliya City", "Nawalapitiya", "Hatton"],
        "Polonnaruwa": ["Polonnaruwa City", "Medirigiriya"],
        "Puttalam": ["Puttalam City", "Wennappuwa", "Chilaw"],
        "Ratnapura": ["Ratnapura City", "Balangoda", "Pelmadulla"],
        "Trincomalee": ["Trincomalee City"],
        "Vavuniya": ["Vavuniya City"]
    };

    const [formData, setFormData] = useState({
        baths: '',
        land_size: '',
        beds: '',
        house_size: '',
        district: '',
        town: ''
    });
    const [townOptions, setTownOptions] = useState([]);
    const [result, setResult] = useState('');

    // Update towns when district changes
    useEffect(() => {
        if (formData.district) {
            setTownOptions(townData[formData.district] || []);
            setFormData(prev => ({ ...prev, town: '' })); // Reset town selection
        }
    }, [formData.district]);

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("🔹 Sending Data:", formData); // Debug Log
    
        try {
            const response = await fetch("http://localhost:5001/api/valuation", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    Baths: formData.baths,
                    Land_size: formData.land_size,
                    Beds: formData.beds,
                    House_size: formData.house_size,
                    district: formData.district,
                    town: formData.town
                })
            });
    
            const data = await response.json();
            console.log("✅ Backend Response:", data); // Debug Log
    
            if (data.error) {
                setResult(`Error: ${data.error}`);
            } else {
                setResult(`Predicted Price: Rs. ${data.predicted_price.toLocaleString()}`);
            }
        } catch (error) {
            console.error("❌ Network Error:", error);
            setResult("Network Error - Please try again later");
        }
    };
    

    return (
<div className="relative min-h-screen flex items-center justify-center bg-cover bg-center" style={{ backgroundImage: "url('/bg-image.png')" }}
>
    <div className="bg-white bg-opacity-90 p-10 rounded-xl shadow-lg w-full max-w-md">
        <h1 className="text-green-600 text-center text-2xl font-bold mb-6">
            🏠 Real Estate Price Predictor
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Baths Input */}
            <div>
                <label htmlFor="baths" className="block text-gray-700 font-semibold mb-1">Baths</label>
                <input
                    type="number"
                    id="baths"
                    value={formData.baths}
                    onChange={handleChange}
                    min="1"
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
            </div>

            {/* Land Size Input */}
            <div>
                <label htmlFor="land_size" className="block text-gray-700 font-semibold mb-1">Land Size (Perches)</label>
                <input
                    type="number"
                    step="0.1"
                    id="land_size"
                    value={formData.land_size}
                    onChange={handleChange}
                    min="0.1"
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
            </div>

            {/* Beds Input */}
            <div>
                <label htmlFor="beds" className="block text-gray-700 font-semibold mb-1">Beds</label>
                <input
                    type="number"
                    id="beds"
                    value={formData.beds}
                    onChange={handleChange}
                    min="1"
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
            </div>

            {/* House Size Input */}
            <div>
                <label htmlFor="house_size" className="block text-gray-700 font-semibold mb-1">House Size (sq.ft)</label>
                <input
                    type="number"
                    id="house_size"
                    value={formData.house_size}
                    onChange={handleChange}
                    min="100"
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
            </div>

            {/* District Select */}
            <div>
                <label htmlFor="district" className="block text-gray-700 font-semibold mb-1">District</label>
                <select
                    id="district"
                    value={formData.district}
                    onChange={handleChange}
                    required
                     className="w-full p-3 border border-gray-300 rounded-lg text-green-700 bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500 cursor-pointer"
                >
                    <option value="" disabled>Select District</option>
                    {Object.keys(townData).map((district) => (
                        <option key={district} value={district}>
                            {district}
                        </option>
                    ))}
                </select>
            </div>

            {/* Town Select */}
            <div>
                <label htmlFor="town" className="block text-gray-700 font-semibold mb-1">Town</label>
                <select
                    id="town"
                    value={formData.town}
                    onChange={handleChange}
                    required
                    disabled={!formData.district}
                    className="w-full p-3 border border-gray-300 rounded-lg text-green-700 bg-white focus:ring-2 focus:ring-green-500 focus:border-green-500 cursor-pointer disabled:bg-gray-200"
                >
                    <option value="" disabled>Select Town</option>
                    {townOptions.map((town) => (
                        <option key={town} value={town}>
                            {town}
                        </option>
                    ))}
                </select>
            </div>

            <button type="submit" className="w-full py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition">
                Predict Price
            </button>
        </form>

        {/* Result Display */}
        {result && (
            <div className={`mt-4 p-3 rounded-lg text-center text-lg ${result.includes('Error') ? 'text-red-600 bg-red-100' : 'text-green-600 bg-green-100'}`}>
                {result}
            </div>
        )}
    </div>
</div>

    );
};

export default ValuationTool;