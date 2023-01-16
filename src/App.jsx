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

  const arrayOfObjects = [];

  for (const date of formattedDate) {
    console.log("date", date);
    arrayOfObjects.push({ date: date });
  }
  console.log("obj", arrayOfObjects);

  console.log("formattedDate", formattedDate);

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
