# Bulgarian cities and their twins

An interactive web map showcasing the twin city relationships of Bulgarian cities around the world.

## Cities Included

The map currently includes data for the following Bulgarian cities:

 - **Sofia** (София)
 - **Plovdiv** (Пловдив)
 - **Varna** (Варна)
 - **Burgas** (Бургас)
 - **Ruse** (Русе)
 - **Stara Zagora** (Стара Загора)
 - **Blagoevgrad** (Благоевград)

## How to use

### Webpage

[Twin cities of Bulgaria](https://p-germanov.github.io/bulgarian-twin-cities-map/)

### Run the website locally

1. **Using Python (Recommended):**
   ```bash
   python3 -m http.server 8000
   ```

2. **Using Node.js:**
   ```bash
   npx http-server
   ```

## Project Structure

```
twin-cities-map/
├── index.html          # Main HTML file
├── css/
│   └── styles.css      # Custom styling
├── js/
│   ├── main.js         # Main application logic
│   └── map-config.js   # Map configuration and data processing
├── data/
│   └── cities.json     # Bulgarian cities and twin cities data
└── README.md           # This file
```

## Data Format

The city data is stored in JSON format with the following structure:

```json
{
  "bulgarianCities": [
    {
      "id": "sofia",
      "name": "Sofia",
      "coordinates": [42.6977, 23.3219],
      "twinCities": [
        {
          "name": "Madrid",
          "country": "Spain",
          "coordinates": [40.4168, -3.7038],
        }
      ]
    }
  ]
}
```

## Adding new cities

To add more Bulgarian cities or twin cities:

1. Edit `data/cities.json`
2. Add new city objects following the existing format
3. Include coordinates (latitude, longitude)

## License

This project is open source and available under the MIT License.

## Contributing

1. Fork the repository
2. Add new cities or improve functionality
3. Test your changes locally
4. Submit a pull request

## Credits

- Map data © [OpenStreetMap](https://www.openstreetmap.org/) contributors
- Mapping library: [Leaflet.js](https://leafletjs.com/)
- Data taken from the [_List of twin towns and sister cities in Bulgaria_](https://en.wikipedia.org/wiki/List_of_twin_towns_and_sister_cities_in_Bulgaria) Wikipedia page
