# Draggable 3D Globe

Using d3 library to generate a choropleth map on a rotating draggable globe. The dataset used for this visualization is the World Airports Dataset provided by: [patrow.net](https://www.partow.net/miscellaneous/airportdatabase/).



## Usage:![d3_point_plotting](https://user-images.githubusercontent.com/101474762/185768551-8e4a6909-bd66-4d6b-8e3f-05d28318b129.gif)

Git clone the repository and open the globe.html file.

In order to use your own information, please update the locations_data.json

## Personalization:
The color of the dots can be updated by changing the "#850101" on the dotColor variable
```javascript
const dotColor ="#850101"
```

Globe dragging and rotating speed can be updated by modyfing the following variable

```javascript
 // defining the rotation and dragging sensitivity of the globe
const sensitivity = 80
```

Tootlip values can be modyfied by updating the following code block

```javascript
// adding the data to the tooltip with desired formatting
tooltip.html(

            "<b>" + country_name + "</b>" + " " + 
            // open flag icon based on the country name
            "<img src='https://countryflagsapi.com/png/" + country_code + "'" + "width=" + "20" + "height=" + "15" + "margin-top=100px" + ">"

)
```
