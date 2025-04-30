import Autocomplete from './autocomplete';

const labelExtractor = (item) => item.login;
const paramsExtractor = (query) => {
  let params = {
    per_page: 10,
  };
  if (query) {
    params.q = query;
  }

  return params;
};
const keyExtractor = (item) => item.id;
const dataExtractor = (data) => data.items; // Extract items from the response

export default function ShowGithubUsers() {
  return (
    <Autocomplete
      data={`https://api.github.com/search/users`}
      labelExtractor={labelExtractor}
      keyExtractor={keyExtractor}
      paramsExtractor={paramsExtractor}
      dataExtractor={dataExtractor}
      onSelect={(item) => {
        console.log(item.id);
      }}
      compareFields={['login']}
    />
  );
}
