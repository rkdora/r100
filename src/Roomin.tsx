import React, { useState, useEffect } from "react";
import styles from "./Login.module.css";
import { Button, FormControl, TextField } from "@material-ui/core";
import { auth } from "./firebase";
import { db } from "./firebase";

const Login: React.FC = (props: any) => {
  const [name, setName] = useState("");

  const newUser = (id: string) => {
    db.collection("users").doc(id).set({ name: name, numbers: "" });
    setName("");
  };

  useEffect(() => {
    const unSub = auth.onAuthStateChanged((user) => {
      user && props.history.push("/");
    });
    return () => unSub();
  }, [props.history]);
  return (
    <div className={styles.login__root}>
      <h1>Welcome!</h1>
      <br />
      <FormControl>
        <TextField
          InputLabelProps={{
            shrink: true,
          }}
          name="name"
          label="Player Name"
          value={name}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setName((e.target.value));
          }}
        />
      </FormControl>
      <br />

      <Button
        variant="contained"
        color="primary"
        size="small"
        onClick={async () => {
          try {
            await auth.signInAnonymously()
            .then(()=>{
                auth.onAuthStateChanged((user) => {
                  if (user) {
                    newUser(user.uid);
                  }
                } 
                )
            })
            .catch((error) => {
              console.log(
                `[error] Can not signin anonymouse (${error.code}:${error.message})`
              );
            });

            props.history.push("/");
          } catch (error: any) {
            alert(error.message);
          }
        }}
      >
        join
      </Button>
      <br />
    </div>
  );
};

export default Login;
