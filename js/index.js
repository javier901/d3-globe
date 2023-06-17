// Original code by: Michael Keith
// Source: https://observablehq.com/@michael-keith/draggable-globe-in-d3

// Credit to Atanu Mallick’s for the original code for plotting points on the globe
// Source: https://bl.ocks.org/atanumallick/8d18989cd538c72ae1ead1c3b18d7b54

// This version of the code introduces the following modifications:
// 1. A tooltip for displaying the countries name, and flag
// 2. Moved dot plotting to canvas element (for performance)
// 3. Added mouseover and mouseout events to the globe (changing opacity of the selected country)
// 4. Added functionality so that points dissapear when the globe is fully rotated
// 5. Comments and code formatting

// DATA SOURCES
// ----------------------------------------
const GEO_JSON_PATH = "data/globeCoordinates.json";
const DATA_JSON_PATH = "data/locationsData.json";
const FLAG_PATH = "./img/flags/";

// COLORS
// ----------------------------------------
const GLOBE_FILL = "#ffffff";
const GLOBE_HOVER_FILL = "#f2f2f2";
const DOT_COLOR = "#000075";

// GLOBE VARIABLES
// ----------------------------------------
const GLOBE_CONTAINER = d3.select("#globe-container");
let GLOBE_WIDTH = GLOBE_CONTAINER.node().getBoundingClientRect().width;
let GLOBE_HEIGHT = GLOBE_CONTAINER.node().getBoundingClientRect().height;
let GLOBE_RADIUS = GLOBE_HEIGHT / 2.5;
let GLOBE_CENTER = [GLOBE_WIDTH / 2, GLOBE_HEIGHT / 2];

// INTERACTION VARIABLES
// ----------------------------------------
const ROTATION_SENSITIVITY = 60;
const ZOOM_SENSITIVITY = 0.5;
let rotationTimer;

// DOT VARIABLES
// ----------------------------------------
const DOT_RADIUS = 0.8;

// MAIN FUNCTION
// ----------------------------------------
async function drawGlobe() {

    // Init variables
    const geoJson = await d3.json(GEO_JSON_PATH);
    const contextData = await d3.json(DATA_JSON_PATH);
    const toolTip = d3.select("#tooltip")

    // Globe initialization
    const geoProjection = d3.geoOrthographic()
        .scale(GLOBE_RADIUS)
        .center([0, 0])
        .rotate([0, -25])
        .translate(GLOBE_CENTER);

    const initialScale = geoProjection.scale();

    // Append svg to the container
    const globeSvg = GLOBE_CONTAINER
        .append("svg")
        .attr("width", GLOBE_WIDTH)
        .attr("height", GLOBE_HEIGHT);

    // Append canvas to the container
    const globeCanvas = GLOBE_CONTAINER
        .append("canvas")
        .attr("width", GLOBE_WIDTH)
        .attr("height", GLOBE_HEIGHT)
        .style("position", "absolute")
        .style("z-index", 0)
        .style("pointer-events", "none");

    const globeDotsCanvas = globeCanvas.node().getContext("2d");

    // Convert geoJson data to svg path
    const geoPathGenerator = d3.geoPath().projection(geoProjection);

    // Set outline of the globe
    globeSvg.append("circle")
        .attr("id", "globe")
        .attr("cx", GLOBE_WIDTH / 2)
        .attr("cy", GLOBE_HEIGHT / 2)
        .attr("r", geoProjection.scale());

    // Append a group to the svg
    const globeMap = globeSvg.append("g")

    // Creating function to update the geoProjection
    globeSvg.call(createDrag(geoProjection, globeSvg, geoPathGenerator, contextData, globeDotsCanvas));

    // Creating function to zoom in and out
    configureZoom(globeSvg, initialScale, geoProjection);

    // Read geoJson data and draw the globe (country by country)
    globeMap.append("g")
        .attr("class", "countries")
        .selectAll("path")
        .data(geoJson.features)
        .enter().append("path")
        .attr("fill", GLOBE_FILL)

        // Mouseover and mouseout events
        .on("mouseover", function (country) {

            // Change opacity of the selected country
            d3.select(this).attr("fill", GLOBE_HOVER_FILL);

            toolTip.transition()
                .style("display", "block")
                .style("left", d3.event.pageX + "px")
                .style("top", d3.event.pageY + "px");

            const countryDict = {
                name: country.properties.name,
                code: country.id,
            };

            updateTooltipContent(countryDict);
        })
        .on("mouseout", function () {

            // Change opacity of the selected country
            d3.select(this).attr("fill", GLOBE_FILL);

            toolTip.transition()
                .style("display", "none");
        });

    // Optional rotate
    rotateGlobe(geoProjection, globeSvg, geoPathGenerator, contextData, globeDotsCanvas);

    window.addEventListener("resize", () => {
        resizeGlobe(geoProjection, globeSvg, globeCanvas, contextData, geoPathGenerator, globeDotsCanvas);
    });

};

// HELPER FUNCTIONS
// ----------------------------------------
function createDrag(geoProjection, globeSvg, geoPathGenerator, contextData, globeDotsCanvas) {
    return d3.drag().on("start", () => {
        rotationTimer.stop();
    })
        .on("drag", () => {
            const rotate = geoProjection.rotate()
            const rotationAdjustmentFactor = ROTATION_SENSITIVITY / geoProjection.scale()

            geoProjection.rotate([
                rotate[0] + d3.event.dx * rotationAdjustmentFactor,
                rotate[1] - d3.event.dy * rotationAdjustmentFactor
            ])

            geoPathGenerator = d3.geoPath().projection(geoProjection)
            globeSvg.selectAll("path").attr("d", geoPathGenerator)

            rotateGlobe(geoProjection, globeSvg, geoPathGenerator, contextData, globeDotsCanvas);
        })
        .on("end", () => {
            rotateGlobe(geoProjection, globeSvg, geoPathGenerator, contextData, globeDotsCanvas);
        });
};

function rotateGlobe(geoProjection, globeSvg, geoPathGenerator, contextData, globeDotsCanvas) {
    if (rotationTimer) rotationTimer.stop();
    rotationTimer = d3.timer(function (elapsed) {
        const rotate = geoProjection.rotate()
        const rotationAdjustmentFactor = ROTATION_SENSITIVITY / geoProjection.scale()
        geoProjection.rotate([
            rotate[0] - 1 * rotationAdjustmentFactor,
            rotate[1]
        ])
        geoPathGenerator = d3.geoPath().projection(geoProjection)
        globeDotsCanvas.clearRect(0, 0, GLOBE_WIDTH, GLOBE_HEIGHT);
        globeSvg.selectAll("path").attr("d", geoPathGenerator)

        drawMarkers(geoProjection, contextData, GLOBE_CENTER, DOT_COLOR, globeDotsCanvas);
    });
};

function configureZoom(globeSvg, initialScale, geoProjection) {
    globeSvg.call(d3.zoom()
        .on('zoom', () => {
            if (d3.event.transform.k > ZOOM_SENSITIVITY) {
                let newScale = initialScale * d3.event.transform.k;
                geoProjection.scale(newScale);
                let path = d3.geoPath().projection(geoProjection);
                globeSvg.selectAll("path").attr("d", path);
                globeSvg.selectAll("circle").attr("d", path);
                globeSvg.selectAll("circle").attr("r", geoProjection.scale());
            } else {
                d3.event.transform.k = ZOOM_SENSITIVITY;
            }
        }));
};

function updateTooltipContent(country) {
    d3.select("#tooltip-country-name").text(country.name);
    d3.select("#tooltip-flag").attr("src", `${FLAG_PATH}${country.code}.png`);
};

function drawMarkers(geoProjection, contextData, center, dotColor, globeDotsCanvas) {

    contextData.forEach(d => {
        const coordinate = [d.longitude, d.latitude];
        const gdistance = d3.geoDistance(coordinate, geoProjection.invert(center));

        // Skip dots that are not visible
        if (gdistance > 1.57) {
            return;
        }

        globeDotsCanvas.beginPath();
        globeDotsCanvas.arc(geoProjection(coordinate)[0], geoProjection(coordinate)[1], DOT_RADIUS, 0, 2 * Math.PI, true);
        globeDotsCanvas.fillStyle = dotColor;
        globeDotsCanvas.fill();
    });
};

function resizeGlobe(geoProjection, globeSvg, globeCanvas, contextData, geoPathGenerator, globeDotsCanvas) {
    GLOBE_WIDTH = GLOBE_CONTAINER.node().getBoundingClientRect().width;
    GLOBE_HEIGHT = GLOBE_CONTAINER.node().getBoundingClientRect().height;

    GLOBE_CENTER = [GLOBE_WIDTH / 2, GLOBE_HEIGHT / 2];

    geoProjection
        .scale(GLOBE_RADIUS)
        .translate(GLOBE_CENTER);

    // Update the svg and canvas dimensions
    globeSvg.attr("width", GLOBE_WIDTH).attr("height", GLOBE_HEIGHT);
    globeCanvas.attr("width", GLOBE_WIDTH).attr("height", GLOBE_HEIGHT);

    // Redraw the globe and markers
    globeSvg.selectAll("path").attr("d", geoPathGenerator);

    // Center the circle
    globeSvg.select("#globe")
        .attr("cx", GLOBE_WIDTH / 2)
        .attr("cy", GLOBE_HEIGHT / 2)
        .attr("r", geoProjection.scale());

    drawMarkers(geoProjection, contextData, GLOBE_CENTER, DOT_COLOR, globeDotsCanvas);
};

// INIT
// ----------------------------------------
drawGlobe();