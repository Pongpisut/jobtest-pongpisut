import React, { useState, useEffect } from "react";
import excelFileURL from "../assets/data.csv";
import * as XLSX from "xlsx";
import ReactApexChart from "react-apexcharts";
import _ from "lodash";

export const Population = () => {
  const [yearIndex, setYearIndex] = useState(0);
  const [excelData, setExcelData] = useState([]);

  useEffect(() => {
    async function readDataExcel() {
      try {
        const response = await fetch(excelFileURL);
        const arrayBuffer = await response.arrayBuffer();
        const data = new Uint8Array(arrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const dataArr = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        setExcelData(dataArr);
      } catch (error) {
        console.error("Error read data in Excel file:", error);
      }
    }

    readDataExcel();
  }, []);

  // จัด data excel
  const convertData = _.map(excelData, (item) => ({
    name: item[0],
    year: item[1],
    data: item[2],
  }));

  // นำ data ที่ group ตามปี
  const newDataSet = Object.values(_.groupBy(convertData, "year")).map(
    (data) => ({
      year: data[0].year,
      data: data,
    })
  );

  // Map Year
  const getYearOptions = () => {
    const years = newDataSet && newDataSet.map((item) => item?.year + "");
    const filteredYears = years.filter((year) => year !== "Year");
    return filteredYears;
  };

  // Map data
  const getChartData = () => {
    const selectedYear = newDataSet && newDataSet[yearIndex];
    if (selectedYear && selectedYear?.data) {
      const sortedData = _.orderBy(selectedYear?.data, "data", "desc");
      const result = sortedData.map((item) => item?.data + "").slice(0, 12);
      return result || [];
    } else {
      return [];
    }
  };

  const chartData = {
    options: {
      chart: {
        id: "animated-bar-chart",
        type: "bar",
      },
      xaxis: {
        position: "top", // Set the y-axis position to "top"
        labels: {
          formatter: function (val) {
            return new Intl.NumberFormat().format(val);
          },
        },
        categories:
          _.orderBy(newDataSet[0]?.data, "data", "desc")
            .map((item) => item?.name + "")
            .slice(0, 12) || [],
      },

      plotOptions: {
        bar: {
          barHeight: "90%",
          horizontal: true,
          distributed: true,
          dataLabels: {
            textAnchor: "end",
            offsetX: 0,
            position: "right",
            offsetY: 0,
          },
        },
      },
      colors: [
        "#33b2df",
        "#546E7A",
        "#d4526e",
        "#13d8aa",
        "#A5978B",
        "#2b908f",
        "#f9a3a4",
        "#90ee7e",
        "#f48024",
        "#69d2e7",
        "#40d237",
        "#62e721",
      ],
      legend: {
        position: "top",
        horizontalAlign: "left",
      },
      dataLabels: {
        textAnchor: "end",
        position: "right",
        offsetX: 100,
        style: {
          colors: ["#000"],
        },
        formatter: function (val) {
          return new Intl.NumberFormat().format(val);
        },
      },
      grid: {
        xaxis: {
          lines: {
            show: true,
          },
        },
        yaxis: {
          lines: {
            show: false,
          },
        },
      },
    },

    series: [
      {
        name: "Population",
        data: getChartData(),
      },
    ],
  };

  const maxYear = _.size(getYearOptions()); // Find the maximum year
  useEffect(() => {
    const interval = setInterval(() => {
      if (yearIndex > maxYear) {
        setYearIndex(0);
      } else {
        setYearIndex((prevYearIndex) => prevYearIndex + 1);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [yearIndex, maxYear]);

  const calTotal = () => {
    // คำนวนจำนวนทั้งหมด
    const sumValue = getChartData();
    const cal =
      sumValue && sumValue.reduce((acc, item) => acc + parseInt(item, 10), 0);

    return cal ? cal.toLocaleString() : 0;
  };

  return (
    <div style={{ margin: "35px", position: "relative" }}>
      <h1 style={{ marginBottom: "0" }}>
        Population growth per country, 1950 to 2021
      </h1>
      <p>Click on the legend below to filter by continent</p>
      <ReactApexChart
        options={chartData.options}
        series={chartData.series}
        type="bar"
        height={500}
      />
      <p
        style={{
          fontSize: "3.5rem",
          marginBottom: "0",
          fontWeight: "600",
          opacity: ".5",
          position: "absolute",
          right: "5%",
          bottom: "20%",
        }}
      >
        {getYearOptions()[yearIndex] ? getYearOptions()[yearIndex] : 0}
      </p>
      <p
        style={{
          fontSize: "1.5rem",
          marginBottom: "0",
          fontWeight: "500",
          opacity: ".5",
          position: "absolute",
          right: "5%",
          bottom: "15%",
        }}
      >
        Total: {calTotal()}
      </p>
    </div>
  );
};
