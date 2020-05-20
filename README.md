# Data-Vis-Narrative
COVID-19 Pack-Chart
1. Data for the chart is taken as a JSON file from the URL:

https://disease.sh/v2/countries

The API for Current cases with detailed information about COVID19 from global data overviews to city/region specific mobility data was taken from here: 

https://disease.sh/docs/

More on this from the authors of this API here:

https://github.com/NovelCOVID/API


2. The chart is aims to explore dependencies in COVID-19 data.

It examines different indicators such as medical system preparedness metrics for COVID-19 pandemic, which can be seen as a ratio between deaths and cases. Higher ratio might indicate worse preparedness for a particular country’s medical system.

Possible enhancements in the future might be to change the table scripting to use a table that allows sorting of values without calling D3.js library (like Datatables).

Other dependenices to explore are number of tests taken and deaths per million citizens. 
