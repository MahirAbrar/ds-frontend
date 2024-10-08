import React from "react";
import { useBreadcrumbs } from "../context/BreadcrumbsContext";
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import GraphComponent from "../components/GraphComponent";
import getPriceElasticity from "../api/getPriceElasticity";
import getDiscountPredict from "../api/getDiscountPredict";
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
} from "chart.js";
Chart.register(
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title
);

const ResultPage = () => {
  const { setItems } = useBreadcrumbs();
  var { storeId, itemId, yearId, discount } = useParams();
  const [results, setResults] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [discountInput, setDiscountInput] = useState("0");
  const [currentDiscount, setCurrentDiscount] = useState("0");
  const [discountLoading, setDiscountLoading] = useState(false);

  const [eventValue, setEventValue] = useState(
    () => Number(localStorage.getItem("eventValue")) || 1
  );
  const [snapValue, setSnapValue] = useState(
    () => Number(localStorage.getItem("snapValue")) || 1
  );
  const [snapBool, setSnapBool] = useState(
    () => JSON.parse(localStorage.getItem("snapBool")) || false
  );
  const [eventBool, setEventBool] = useState(
    () => JSON.parse(localStorage.getItem("eventBool")) || false
  );

  const [basePrice, setBasePrice] = useState(null);
  const [baseDemand, setBaseDemand] = useState(null);
  const [rmse, setRmse] = useState(null);
  const [score, setScore] = useState(null);

  const [impactOnSales, setImpactOnSales] = useState(null);
  const [predictedDemand, setPredictedDemand] = useState(null);
  const [elasticityScore, setElasticityScore] = useState(null);
  const [elasticityInterpretation, setElasticityInterpretation] =
    useState(null);

  const [costPrice, setCostPrice] = useState(null);
  const [stockOnHand, setStockOnHand] = useState(null);
  const [priceDiscount, setPriceDiscount] = useState(null);
  const [optimizedPrice, setOptimizedPrice] = useState(null);
  const [totalSold, setTotalSold] = useState(null);
  const [totalRevenue, setTotalRevenue] = useState(null);
  const [profitLoss, setProfitLoss] = useState(null);
  const [days, setDays] = useState(null);

  const [x_actual, setX_actual] = useState(null);
  const [x_values, setX_values] = useState(null);
  const [y_actual, setY_actual] = useState(null);
  const [y_predicted, setY_predicted] = useState(null);

  useEffect(() => {
    setItems([
      { label: "Home", path: "/" },
      { label: "Store", path: "/select" },
      { label: "Item", path: `/select/${storeId}` },
      { label: "Year", path: `/select/${storeId}/${itemId}` },
      { label: "Result" },
    ]);
    getPriceElasticity(
      storeId,
      itemId,
      yearId,
      discount,
      eventBool,
      snapBool,
      eventValue,
      snapValue
    ).then((data) => {
      setResults(data);
      setIsLoading(false);

      // model
      setBasePrice(data["Base Price"]);
      setBaseDemand(data["Base Demand"]);
      setRmse(data["RMSE"]);
      setScore(data["Score"]);

      // discount
      setImpactOnSales(data["Impact on Sales"]);
      setPredictedDemand(data["Predicted Demand"]);
      setElasticityScore(data["Elasticity Score"]);
      setElasticityInterpretation(data["Elasticity Interpretation"]);

      // price optimisation
      setCostPrice(data["Cost Price/Item"]);
      setStockOnHand(data["Stock on Hand"]);
      setPriceDiscount(data["Price Discount"]);
      setOptimizedPrice(data["Optimized Price"]);
      setTotalSold(data["Total item(s) sold"]);
      setTotalRevenue(data["Total Revenue"]);
      setProfitLoss(data["PROFIT/LOSS"]);
      setDays(data["Gain profit in (days)"]);

      // graph scatter
      setX_actual(data["x_actual"]);
      setY_actual(data["y_actual"]);

      // line
      setX_values(data["x_values"]);
      setY_predicted(data["y_predicted"]);
    });
  }, []);

  // Input handlers
  const handlePredictionInput = (e) => {
    const value = Math.max(0, Math.min(99, Number(e.target.value)));
    setDiscountInput(value.toString());
  };

  const handlePredictClick = () => {
    setCurrentDiscount(discountInput);

    setDiscountLoading(true);
    getDiscountPredict(
      storeId,
      itemId,
      yearId,
      discountInput,
      eventBool,
      snapBool,
      eventValue,
      snapValue
    ).then((data) => {
      // discount
      setImpactOnSales(data["Impact on Sales"]);
      setPredictedDemand(data["Predicted Demand"]);
      setElasticityScore(data["Elasticity Score"]);
      setElasticityInterpretation(data["Elasticity Interpretation"]);

      setDiscountLoading(false);
    });
  };

  const stores = {
    st1Cal: "CA_1",
    st2Cal: "CA_2",
    st3Cal: "CA_3",
    st4Cal: "CA_4",
    st1Tex: "TX_1",
    st2Tex: "TX_2",
    st3Tex: "TX_3",
    st1Win: "WI_1",
    st2Win: "WI_2",
    st3Win: "WI_3",
  };

  const graphTitle = `Model for ${itemId} in ${
    stores[storeId]
  } for ${yearId} with number of SNAP: ${
    snapBool ? snapValue : 0
  } and number of Event: ${eventBool ? eventValue : 0}`;

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <div className="flex flex-row items-center gap-6 flex-wrap">
        <div className="bg-white p-4 rounded-lg flex flex-col gap-x-6 justify-center items-center">
          {/* title */}
          <h1 className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl font-bold">
            Model Information{" "}
          </h1>
          <div className=" p-4 rounded-lg flex flex-row gap-x-6">
            <div className="flex flex-col gap-y-2 ">
              <h1 className="text-xs sm:text-xs md:text-sm lg:text-base xl:text-lg font-bold">
                Base Price{" "}
              </h1>
              <h1 className="text-xs sm:text-xs md:text-sm lg:text-base xl:text-lg font-bold">
                Base Demand
              </h1>
              <h1 className="text-xs sm:text-xs md:text-sm lg:text-base xl:text-lg font-bold">
                RMSE{"  "}
                <div
                  className="tooltip tooltip-right"
                  data-tip="RMSE (Root Mean Square Error) is a statistical measure used to quantify the average difference between observed values and predicted values"
                >
                  <FontAwesomeIcon icon={faInfoCircle} />
                </div>
              </h1>
              <h1 className="text-xs sm:text-xs md:text-sm lg:text-base xl:text-lg font-bold">
                Score{"    "}
                <div
                  className="tooltip tooltip-right"
                  data-tip="Measurement of the proportion of the variance in the dependent variable (target) that is predictable from the independent variables (features)"
                >
                  <FontAwesomeIcon icon={faInfoCircle} />
                </div>
              </h1>
            </div>
            <div className="flex flex-col gap-y-2">
              <h1 className="text-xs sm:text-xs md:text-sm lg:text-base xl:text-lg font-bold">
                {basePrice}
              </h1>
              <h1 className="text-xs sm:text-xs md:text-sm lg:text-base xl:text-lg font-bold">
                {baseDemand}
              </h1>
              <h1 className="text-xs sm:text-xs md:text-sm lg:text-base xl:text-lg font-bold">
                {rmse}
              </h1>
              <h1 className="text-xs sm:text-xs md:text-sm lg:text-base xl:text-lg font-bold">
                {score}
              </h1>
            </div>
          </div>
          <div className="form-control">
            <label className="label" htmlFor="discountInput">
              <span className="label-text">
                Enter prediction discount (0-99):
              </span>
            </label>
            <input
              type="number"
              id="discountInput"
              value={discountInput}
              onChange={handlePredictionInput}
              className="input input-bordered input-primary w-full max-w-xs"
              min="0"
              max="99"
            />
            <button
              className="btn btn-primary mt-4"
              onClick={handlePredictClick}
            >
              Predict
            </button>
          </div>
          <div className="p-4 rounded-lg flex flex-row gap-x-6">
            <div className="flex flex-col gap-y-2">
              <h1 className="text-xs sm:text-xs md:text-sm lg:text-base xl:text-lg font-bold">
                Impact on Sales{" "}
              </h1>
              <h1 className="text-xs sm:text-xs md:text-sm lg:text-base xl:text-lg font-bold">
                Predicted Demand
              </h1>
              <h1 className="text-xs sm:text-xs md:text-sm lg:text-base xl:text-lg font-bold">
                Elasticity Score:{"  "}
              </h1>
              <h1 className="text-xs sm:text-xs md:text-sm lg:text-base xl:text-lg font-bold">
                Elasticity Interpretation: {"  "}
              </h1>
            </div>
            <div className="flex flex-col gap-y-2">
              <h1 className="text-xs sm:text-xs md:text-sm lg:text-base xl:text-lg font-bold">
                {impactOnSales}
              </h1>
              <h1 className="text-xs sm:text-xs md:text-sm lg:text-base xl:text-lg font-bold">
                {predictedDemand}
              </h1>
              <h1 className="text-xs sm:text-xs md:text-sm lg:text-base xl:text-lg font-bold">
                {elasticityScore}
              </h1>
              <h1 className="text-xs sm:text-xs md:text-sm lg:text-base xl:text-lg font-bold">
                {elasticityInterpretation}
              </h1>
            </div>
          </div>
        </div>
        {/* 2nd box */}

        <div className="bg-white p-4 rounded-lg flex flex-col gap-x-6 justify-center items-center flex-grow h-[500px] w-96">
          {x_actual &&
          x_values &&
          y_actual &&
          y_predicted &&
          Array.isArray(x_actual) &&
          Array.isArray(x_values) &&
          Array.isArray(y_actual) &&
          Array.isArray(y_predicted) &&
          x_actual.length > 0 &&
          x_values.length > 0 &&
          y_actual.length > 0 &&
          y_predicted.length > 0 ? (
            <GraphComponent
              x_actual={x_actual}
              x_values={x_values}
              y_actual={y_actual}
              y_predicted={y_predicted}
              graphTitle={graphTitle}
            />
          ) : (
            <div>Not enough data to display graph</div>
          )}
        </div>
      </div>

      {/* third box */}

      <div className="bg-white p-4 rounded-lg flex flex-col gap-x-6 justify-center items-center mt-6">
        {/* title */}
        <h1 className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl font-bold">
          Price optimisation{" "}
        </h1>
        <div className="flex flex-row gap-x-6">
          <div className="flex flex-col gap-y-2 ">
            <h1 className="text-xs sm:text-xs md:text-sm lg:text-base xl:text-lg font-bold">
              Cost Price/Item{" "}
            </h1>
            <h1 className="text-xs sm:text-xs md:text-sm lg:text-base xl:text-lg font-bold">
              Stock on Hand
            </h1>
            <h1 className="text-xs sm:text-xs md:text-sm lg:text-base xl:text-lg font-bold">
              Price Discount{"  "}
            </h1>
            <h1 className="text-xs sm:text-xs md:text-sm lg:text-base xl:text-lg font-bold">
              Optimized Price
            </h1>
            <h1 className="text-xs sm:text-xs md:text-sm lg:text-base xl:text-lg font-bold">
              Total item(s) sold
            </h1>
            <h1 className="text-xs sm:text-xs md:text-sm lg:text-base xl:text-lg font-bold">
              Total Revenue
            </h1>
            <h1 className="text-xs sm:text-xs md:text-sm lg:text-base xl:text-lg font-bold">
              PROFIT/LOSS
            </h1>
            <h1 className="text-xs sm:text-xs md:text-sm lg:text-base xl:text-lg font-bold">
              Gain profit in (days)
            </h1>
          </div>

          <div className="flex flex-col gap-y-2">
            <h1 className="text-xs sm:text-xs md:text-sm lg:text-base xl:text-lg font-bold">
              {costPrice}
            </h1>
            <h1 className="text-xs sm:text-xs md:text-sm lg:text-base xl:text-lg font-bold">
              {stockOnHand}
            </h1>
            <h1 className="text-xs sm:text-xs md:text-sm lg:text-base xl:text-lg font-bold">
              {priceDiscount}
            </h1>
            <h1 className="text-xs sm:text-xs md:text-sm lg:text-base xl:text-lg font-bold">
              {optimizedPrice}
            </h1>
            <h1 className="text-xs sm:text-xs md:text-sm lg:text-base xl:text-lg font-bold">
              {totalSold}
            </h1>
            <h1 className="text-xs sm:text-xs md:text-sm lg:text-base xl:text-lg font-bold">
              {totalRevenue}
            </h1>
            <h1 className="text-xs sm:text-xs md:text-sm lg:text-base xl:text-lg font-bold">
              {profitLoss}
            </h1>
            <h1 className="text-xs sm:text-xs md:text-sm lg:text-base xl:text-lg font-bold">
              {days}
            </h1>
          </div>
        </div>
      </div>
    </>
  );
};

export default ResultPage;
