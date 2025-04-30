import styles from "./App.module.scss";
import ShowGithubUsers from "./components/show-github-users.jsx";
import ShowUSStates from "./components/show-us-states.jsx";

function App() {
  return (
    <div className={styles.content}>
      <div>
        <label>States</label>
        <ShowUSStates />
      </div>
      <div>
        <label>Github users</label>
        <ShowGithubUsers />
      </div>
    </div>
  );
}

export default App;
