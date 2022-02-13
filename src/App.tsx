import { FormControl, TextField, List } from "@material-ui/core";
import React, { useState, useEffect } from "react";
import styles from "./App.module.css";
import { db } from "./firebase";
import AddToPhotosIcon from "@material-ui/icons/AddToPhotos";
import DoneIcon from "@material-ui/icons/Done";
import TaskItem from "./TaskItem";
import UserItem from "./UserItem";
import { makeStyles } from "@material-ui/styles";

import { auth } from "./firebase";
import ExitToAppIcon from "@material-ui/icons/ExitToApp";

const useStyles = makeStyles({
  field: {
    marginTop: 30,
    marginBottom: 20,
  },
  list: {
    margin: "auto",
    width: "30%",
  },
});

const App: React.FC = (props: any) => {
  const [tasks, setTasks] = useState([{ id: "", title: "" }]);
  const [field, setField] = useState({ id: "", name: "", number: "" });
  const [users, setUsers] = useState([{ id: "", name: "" }]);
  const [currentUser, setCurrentUser] = useState({
    id: "",
    name: "",
    numbers: "",
  });
  const [input, setInput] = useState("");
  const classes = useStyles();

  useEffect(() => {
    const unSub = auth.onAuthStateChanged((user) => {
      !user && props.history.push("welcome");
      if (user) {
        const docRef = db.collection("users").doc(user.uid);

        docRef
          .get()
          .then(async (doc) => {
            if (doc.exists) {
              // console.log(doc.data());
              const data = doc.data();
              if (data) {
                setCurrentUser({
                  id: doc.id,
                  name: data.name,
                  numbers: data.numbers,
                });
              }
            } else {
              try {
                await auth.signOut();
                props.history.push("welcome");
              } catch (error: any) {
                alert(error.message);
              }
            }
          })
          .catch((error) => {
            alert("Error getting document:" + error);
          });
      }
    });
    return () => unSub();
  });

  useEffect(() => {
    const unSub = db.collection("tasks").onSnapshot((snapshot) => {
      setTasks(
        snapshot.docs.map((doc) => ({ id: doc.id, title: doc.data().title }))
      );
    });
    return () => unSub();
  }, []);

  useEffect(() => {
    const unSub = db.collection("users").onSnapshot((snapshot) => {
      setUsers(
        snapshot.docs.map((doc) => ({ id: doc.id, name: doc.data().name }))
      );
    });
    return () => unSub();
  }, []);

  useEffect(() => {
    const unSub = db
      .collection("field")
      .doc("1")
      .onSnapshot((snapshot) => {
        const data = snapshot.data();
        if (data) {
          setField({ id: snapshot.id, name: data.name, number: data.number });
        }
      });
    return () => unSub();
  }, []);

  const submit = (e: React.MouseEvent<HTMLButtonElement>) => {
    db.collection("field")
      .doc("1")
      .update({ name: currentUser.name, number: e.currentTarget.innerText });
    db.collection("users").doc(currentUser.id).update({ numbers: "" });
    setInput("");
  };

  const newTask = (e: React.MouseEvent<HTMLButtonElement>) => {
    db.collection("tasks").add({ title: input });
    setInput("");
  };

  const makeNumbers = (n: number) => {
    /** 重複チェック用配列 */
    var randoms: number[] = [];
    /** 最小値と最大値 */
    var min = 1,
      max = 100;

    /** 重複チェックしながら乱数作成 */
    for (let i = min; i <= n; i++) {
      while (true) {
        var tmp = intRandom(min, max);
        if (!randoms.includes(tmp)) {
          randoms.push(tmp);
          break;
        }
      }
    }

    /** min以上max以下の整数値の乱数を返す */
    function intRandom(min: number, max: number) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    return randoms;
  };

  const start = () => {
    const randoms = makeNumbers(users.length);

    for (let i = 0; i < users.length; i++) {
      db.collection("users")
        .doc(users[i].id)
        .set({ numbers: String(randoms[i]) }, { merge: true });
    }

    db.collection("field").doc("1").update({ name: "", number: "0" });
  };

  return (
    <div className={styles.app__root}>
      <h1>
        {currentUser.name !== "" ? "Hello! " + currentUser.name : "Hello!"}
      </h1>
      <button
        className={styles.app__logout}
        onClick={async () => {
          try {
            await auth.signOut();
            props.history.push("welcome");
          } catch (error: any) {
            alert(error.message);
          }
        }}
      >
        <ExitToAppIcon />
      </button>
      <br />

      <h2>Users</h2>

      <List className={classes.list}>
        {users.map((user) => (
          <UserItem key={user.id} id={user.id} name={user.name} />
        ))}
      </List>

      <br />

      <button className={styles.app__icon} onClick={start}>
        START
        <DoneIcon />
      </button>

      <hr />

      <h2>My Numbers</h2>
      <button className={styles.app__number} onClick={submit}>
        {currentUser.numbers}
      </button>
      <hr />
      <h2>Field</h2>
      <h3>{field.name}</h3>
      <h3 className={styles.app__number}>{field.number}</h3>

      <hr />

      <h2>Tasks</h2>
      <FormControl>
        <TextField
          className={classes.field}
          InputLabelProps={{
            shrink: true,
          }}
          label="New task ?"
          value={input}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setInput(e.target.value)
          }
        />
      </FormControl>
      <button
        className={styles.app__icon_submit}
        disabled={!input}
        onClick={newTask}
      >
        <AddToPhotosIcon />
      </button>

      <List className={classes.list}>
        {tasks.map((task) => (
          <TaskItem key={task.id} id={task.id} title={task.title} />
        ))}
      </List>
    </div>
  );
};

export default App;
