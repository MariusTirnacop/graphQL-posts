import "./App.css";
import { gql, useQuery } from "@apollo/client";
import { ParentSize } from "@visx/responsive";

import PostsGraph from "./PostsGraph";
import { HashLoader } from "react-spinners";
import RingLoader from "react-spinners/RingLoader";

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

  const { error, data, loading } = useQuery(GET_POSTS, { variables: { count: 50 } });
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

  const groupedDates = formattedDate?.reduce((acc, date) => {
    const month = date.slice(5, 7);
    if (!acc[month]) {
      acc[month] = [];
    }
    acc[month].push(date);
    return acc;
  }, {});

  console.log("groupedDates", groupedDates);

  const arrayOfObjects = Object.entries(groupedDates ? groupedDates : {})?.map(([month, dates]) => ({ month, dates }));
  console.log("arrayofobj", arrayOfObjects);

  const sortedArray = arrayOfObjects.sort((a, b) => a.month - b.month);
  console.log("sortedArray", sortedArray);

  const sortByMonth = formattedDate?.sort((a, b) => {
    const aMonth = a.split("-")[1];
    const bMonth = b.split("-")[1];
    return aMonth - bMonth;
  });

  console.log("sortByMonth", sortByMonth);

  return (
    <div className="App">
      {error ? <p>There was an error, please try again.</p> : null}
      {loading ? (
        <div className="loading-container">
          <p>Loading graph...</p>
          <RingLoader color="rgba(6, 31, 71, 1)" size={150} />
        </div>
      ) : (
        <ParentSize>
          {({ width, height }) => (
            <PostsGraph width={width - 200} height={height} data={allPostsData} formattedDate={formattedDate} />
          )}
        </ParentSize>
      )}
    </div>
  );
}

export default App;
