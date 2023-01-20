import "./App.css";
import { gql, useQuery } from "@apollo/client";
import { ParentSize } from "@visx/responsive";
import { ToastContainer } from "react-toastify";

import PostsGraph from "./PostsGraph/PostsGraph";
import RingLoader from "react-spinners/RingLoader";

export const COUNT = Math.floor(Math.random() * (200 - 100 + 1) + 100);

function App() {
  const GET_POSTS = gql`
    query allPosts($count: Int) {
      allPosts(count: $count) {
        createdAt
      }
    }
  `;

  const { error, data, loading } = useQuery(GET_POSTS, { variables: { count: COUNT } });
  const dataToUse = data ? data : [];
  const allPostsData = dataToUse?.allPosts;

  const createdAt = allPostsData?.map((post) => post.createdAt);

  const formattedDate = createdAt?.map((dateCreatedAt) => {
    const date = new Date(Number(dateCreatedAt));
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const formattedAndPadded = month.toString().padStart(2, "0");
    if (year === 2019) return formattedAndPadded;
  });

  return (
    <div className="App">
      <ToastContainer
        position="top-center"
        autoClose={2500}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />

      {error ? <p>There was an error, please try again.</p> : null}
      {loading ? (
        <div className="loading-container">
          <p>Loading graph...</p>
          <RingLoader color="rgba(6, 31, 71, 1)" size={150} />
        </div>
      ) : (
        <ParentSize>{({ width, height }) => <PostsGraph width={width - 100} height={height} data={formattedDate} />}</ParentSize>
      )}
    </div>
  );
}

export default App;
