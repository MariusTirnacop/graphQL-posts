# Graph App

## Creating a JavaScript Web Application for Visualizing Post Creation in 2019 Using a Mock GraphQL API

### Tools and Technologies used

- **Tools**: NPM, React, GraphQL, Apollo, Visx, React Toastify, React Spinners

#### Functionality

- **The application allows users to view the total number of posts created in 2019 by month**
- **Data is fetched from a mock GraphQL API -> everytime to fetch button is clicked or the user refreshes the page, the ammount of data that comes back is a random number between 100-200**
- **When the data is loading, a loading spinner is displayed**
- **When a user clicks on a bar in the graph, a toast notification is displayed with the month and the number of posts created in that month**
- **When the data is fetched, the graph is updated with the new data**
- **Y Axis is dynamic and adjusts to the highest number of posts created in a month**
- **X Axis is static and displays the months of the year**
- **The graph is responsive and adjusts to the size of the screen**
- **The graph is interactive and allows users to hover over the bars to see the number of posts created in that month**
- **The legend displaying the number of posts is dyanamic. Green represents the posts > 50% of the highest number of posts created in a month. Red represents the posts < 50% of the highest number of posts created in a month.**
