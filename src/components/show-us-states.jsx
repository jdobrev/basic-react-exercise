import Autocomplete from './autocomplete';

import data from '../constants/us-states.json';

const labelExtractor = (item) => item.name;
const keyExtractor = (item) => item.name;

export default function ShowUSStates() {
  return (
    <Autocomplete
      data={data}
      compareFields={['name']}
      labelExtractor={labelExtractor}
      keyExtractor={keyExtractor}
    />
  );
}
