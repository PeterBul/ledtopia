const SOCKET_ENDPOINT = "ws://192.168.32.74:3000";
const API_ENDPOINT = "http://192.168.32.74:3000";

const ws = new WebSocket(SOCKET_ENDPOINT + "/graphql", "graphql-ws");

ws.addEventListener("open", () => {
  ws.send(
    JSON.stringify({
      type: "connection_init",
      payload: { Authorization: "Bearer" },
    })
  );
  console.log("web socket open");
});

function waitForSocketConnection(callback: () => void) {
  setTimeout(function () {
    if (ws.readyState === 1) {
      console.log("Connection is made");
      callback();
    } else {
      waitForSocketConnection(callback);
    }
  }, 5); // wait 5 milisecond for the connection...
}

export const subscribeData = (
  { query, variables = {} }: { query: any; variables?: any },
  callback: (data: any) => void
) => {
  waitForSocketConnection(() => {
    ws.send(
      JSON.stringify({
        id: Math.random().toString(36).substring(7),
        type: "start",
        payload: {
          extensions: {},
          operationName: null,
          query: query,
          variables,
        },
      })
    );
  });

  ws.addEventListener("message", (val) => {
    console.log("Received message", val);
    const res = JSON.parse(val.data);
    if (res.type === "data") {
      // @ts-ignore
      callback(res.payload.data);
    }
  });
};

// TODO: Create types for queries and variables
export const getData = async ({
  query,
  variables,
}: {
  query: any;
  variables?: any;
}) => {
  try {
    console.log(query, variables);
    const { data, errors = [] } = await fetch(API_ENDPOINT + "/graphql", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    }).then((res) => res.json());
    console.log(data);

    if (errors.length > 0) {
      console.log(
        `GraphQL call errored with:`,
        JSON.stringify(errors, null, 2)
      );
      throw new Error("GraphQL query failed, better check the logs.");
    }

    return data;
  } catch (err) {
    console.log("fetch() failed", err);
  }
};
