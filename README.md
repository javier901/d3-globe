### Main Features
1. Tooltip that displays the country name and flag.
2. Drag and rotate features for the globe.
3. Point plotting at every latitude and longitude coordinate.
4. Mouse-over and mouse-out events that highlight the country.
5. Detailed comments and well-structured code for easy understanding and modification.

### Data Sources
 - data/globeCoordinates.json - Contains the geographical coordinates needed for the globe
 - data/locationsData.json - Contains the airport data (latitude and longitude coordinates)
 - img/flags/ - Contains flags of different countries

### Customization:
**Dots Color**: The color of the dots can be changed by updating the DOT_COLOR constant.

**Globe Interaction**: The sensitivity of the globe's drag and rotate features can be changed by adjusting the ROTATION_SENSITIVITY constant.

**Tooltip Information**: If you want to include new information in the tooltip, you can update the countryDict object inside the mouseover event handler.

**Location Data**: If you want to use your own information, please update the locationsData.json file. The format of the file should be as follows (coordinates in degrees):
```
[
  {"latitude":-6.082,"longitude":145.392},
  {"latitude":-5.207,"longitude":145.788},
  {"latitude":-5.826,"longitude":144.296},
  ...
]
```
