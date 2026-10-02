// const { ApolloClient, InMemoryCache, gql } = require('@apollo/client/core');

// const client = new ApolloClient({
//     uri: 'http://localhost:5000',
//     cache: new InMemoryCache(),
// });

// (async () => {
//     try {
//         const data = await client.query({
//             query: gql`
//                 query {
//                     quotes {
//                         data {
//                             code
//                         }
//                     }
//                 }
//             `,
//         });
//         console.log(data)
//     } catch (e) {
//         console.error(e)
//     }
// })();

const query = `
    query Data {
        quotes {
            data {
                bid
            }
        }
        news {
            data {
                title
            }
        }
    }
`;

async function fetchProduct() {
  const response = await fetch("http://localhost:5000/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: query,
      variables: { code: "BSP" },
    }),
  });

  const { data, errors } = await response.json();

  if (errors) {
    console.error(errors);
  } else {
    console.log(data);
  }
}

fetchProduct();
