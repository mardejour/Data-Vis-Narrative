# Data-Vis-Narrative
COVID-19 Pack-Chart

Data for the chart is taken as a JSON file from the URL:

https://disease.sh/v2/countries

The API for Current cases with detailed information about COVID19 from global data overviews to city/region specific mobility data was taken from here: 

https://disease.sh/docs/

More on this from the authors of this API here:

https://github.com/NovelCOVID/API


This dashboard aims to explore dependencies in COVID-19 data.

It examines different indicators such as medical system preparedness metrics for COVID-19 pandemic, which can be seen as a ratio between deaths and cases. Higher ratio might indicate worse preparedness for a particular country’s medical system.

Possible enhancements in the future might be to change the table scripting to use a table that allows sorting of values without calling D3.js library (like Datatables).

The data allows us to expore a number of dependenices including number of tests taken and deaths per million citizens. In addition, the data feed has country flag images as links that could be used in circles as SVG image elements. 

Misc: the circle pack layout is not efficient enough to be practical for small values, so we changed the line .sum(([key, values]) => values.countCases) to
.sum(([key, values]) => Math.log(values.countCases))

The switch for transitioning the chart with updated data to new values showing cases/deaths was achieved by changing the root to summarize the number of deaths. This was done by adding another variable rootD such that the radio button calls the update function that would change the data and transition circles to new values.

