import React, { useState } from "react";
import styles from "./TaskItem.module.css"
import { ListItem } from "@material-ui/core";
import DeleteOutlineOutlinedIcon from "@material-ui/icons/DeleteOutlineOutlined";
import { db } from "./firebase";

interface PROPS {
  id: string;
  name: string;
}

const UserItem: React.FC<PROPS> = (props) => {
  const deleteUser=()=> {
      db.collection("users").doc(props.id).delete();
  }
  
  return (
    <ListItem>
      <h2>{props.name}</h2>
      <button className={styles.taskitem__icon} onClick={deleteUser}>
          <DeleteOutlineOutlinedIcon />
      </button>
    </ListItem>
  );
};

export default UserItem;
