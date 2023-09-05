import { HStack, Switch, Text } from '@chakra-ui/react';
import { useDispatch, useSelector } from 'react-redux';
import { setTutorialOn } from '../store/tutorialSlice';

export default function TutorialSwitch() {
  const dispatch = useDispatch();

  const { tutorialOn } = useSelector((state) => state.tutorial);

  return (
    <HStack
      justify='space-between'
      padding={2.5}>
      <Text
        fontSize='2xs'
        fontWeight='bold'
        color='white'>
        Tutorial
      </Text>
      <Switch
        size='sm'
        isChecked={tutorialOn}
        onChange={(e) => dispatch(setTutorialOn(e.target.checked))}
      />
    </HStack>
  );
}
