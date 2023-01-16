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
        author {
          id
          firstName
          lastName
          avatar
        }
      }
    }
  `;

  const { error, data } = useQuery(GET_POSTS, { variables: { count: 50 } });

  const allPostsData = data?.allPosts;
  console.log("allPostsData", allPostsData);
  const createdAt = allPostsData?.map((post) => post.createdAt);
  console.log("createdAt", createdAt);

  const formattedDate = createdAt?.map((dateCreatedAt) => {
    const toNumber = Number(dateCreatedAt);
    const date = new Date(toNumber);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${year}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
  });

  console.log("formattedDate", formattedDate);

  const sortByMonth = formattedDate?.sort((a, b) => {
    const aMonth = a.split("-")[1];
    console.log("aMonth", aMonth);
    const bMonth = b.split("-")[1];
    return aMonth - bMonth;
  });

  console.log("sortByMonth", sortByMonth);

  return (
    <div className="App">
      <ParentSize>{({ width, height }) => <Example width={width} height={height} />}</ParentSize>,
    </div>
  );
}

export default App;
