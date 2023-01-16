import "./App.css";
import { gql, useQuery } from "@apollo/client";
import axios from "axios";

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

  const endpoint = "https://fakerql.goosfraba.ro/graphql";
  const headers = {
    "content-type": "application/json",
  };
  const graphqlQuery = {
    operationName: "allPosts",
    query: `
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
  `,
    variables: { count: 40 },
  };

  const response = axios({
    url: endpoint,
    method: "post",
    headers: headers,
    data: graphqlQuery,
  });

  console.log(response.data); // data
  console.log(response.errors); // errors if any

  const { error, data } = useQuery(GET_POSTS, { variables: { count: 40 } });
  console.log(data?.allPosts);

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

  // console.log("error", error);

  return (
    <div className="App">
      <p>hi</p>
    </div>
  );
}

export default App;
