import "./App.css";
import { gql, useQuery } from "@apollo/client";
import ParentSize from "@visx/responsive/lib/components/ParentSize";

import Example from "./Example";

function App() {
  const GET_POSTS = gql`
    query allPosts($count: Int) {
      allPosts(count: $count) {
        id
        title
        body
        published
        createdAt
      }
    }
  `;

  const { error, data } = useQuery(GET_POSTS, { variables: { count: 50 } });
  const dataToUse = data ? data : [];
  const allPostsData = dataToUse?.allPosts;

  console.log("allPostsData", allPostsData);
  const createdAt = allPostsData?.map((post) => post.createdAt);
  console.log("createdAt", createdAt);

  const formattedDate = createdAt?.map((dateCreatedAt) => {
    const toNumber = Number(dateCreatedAt);
    const date = new Date(toNumber);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const formattedAndPadded = `${year}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;

    return formattedAndPadded;
  });

  console.log("formattedDatee", formattedDate);

  // const checkIfExists = (array, value) => {
  //   const day = value.split("-")[2];
  //   const month = value.split("-")[1];

  //   // if the

  //   console.log("filteredArray", filteredArray);

  //   return filteredArray.length > 0;
  // };

  // const uniqueDates = [];
  // for (const date of formattedDate) {
  //   console.log("date", date);
  // }

  const groupedDates = formattedDate.reduce((acc, date) => {
    const month = date.slice(5, 7);
    if (!acc[month]) {
      acc[month] = [];
    }
    acc[month].push(date);
    return acc;
  }, {});

  console.log("groupedDates", groupedDates);

  const arrayOfObjects = Object.entries(groupedDates).map(([month, dates]) => ({ month, dates }));
  console.log("arrayofobj", arrayOfObjects);

  const sortedArray = arrayOfObjects.sort((a, b) => a.month - b.month);
  console.log("sortedArray", sortedArray);

  // console.log("uniqueDates", uniqueDates);

  // const arrayOfObjects = [];

  // for (const date of formattedDate) {
  //   console.log("date", date);
  //   arrayOfObjects.push({ date: date });
  // }
  // console.log("obj", arrayOfObjects);

  const sortByMonth = formattedDate?.sort((a, b) => {
    const aMonth = a.split("-")[1];
    // console.log("aMonth", aMonth);
    const bMonth = b.split("-")[1];
    return aMonth - bMonth;
  });

  console.log("sortByMonth", sortByMonth);

  return (
    <div className="App">
      {error && <p>Error</p>}
      <ParentSize>
        {({ width, height }) => <Example width={width} height={height} data={allPostsData} formattedDate={formattedDate} />}
      </ParentSize>
    </div>
  );
}

export default App;
