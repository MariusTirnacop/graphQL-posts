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
        createdAt
      }
    }
  `;

  const { error, data, loading } = useQuery(GET_POSTS, { variables: { count: 50 } });
  const dataToUse = data ? data : [];
  const allPostsData = dataToUse?.allPosts;

  // console.log("allPostsData", allPostsData);
  const createdAt = allPostsData?.map((post) => post.createdAt);
  // console.log("createdAt", createdAt);

  const formattedDate = createdAt?.map((dateCreatedAt) => {
    const date = new Date(Number(dateCreatedAt));
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    // console.log("year", typeof year);
    const formattedAndPadded = month.toString().padStart(2, "0");
    if (year === 2019) return formattedAndPadded;
  });

  console.log("formattedDatee", formattedDate);

  return (
    <div className="App">
      {error ? <p>There was an error, please try again.</p> : null}
      {loading ? (
        <div className="loading-container">
          <p>Loading graph...</p>
          <RingLoader color="rgba(6, 31, 71, 1)" size={150} />
        </div>
      ) : (
        <ParentSize>{({ width, height }) => <PostsGraph width={width - 200} height={height} data={formattedDate} />}</ParentSize>
      )}
    </div>
  );
}

export default App;
