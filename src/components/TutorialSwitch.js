import { HStack, Switch, Text, Tooltip } from '@chakra-ui/react';
import { useAppDispatch as useDispatch, useAppSelector as useSelector } from '../hooks/hooks';
import { setTutorialOn } from '../store/tutorialSlice';
import { IconButton } from '@chakra-ui/react';
import { RepeatIcon } from '@chakra-ui/icons';
import { restartTutorial } from '../store/tutorialSlice';

export default function TutorialSwitch() {
  const dispatch = useDispatch();

  const { tutorialOn } = useSelector((state) => state.tutorial);

  return (
    <HStack
      justify='space-between'
      padding={2.5}>
      <Tooltip
        label={
          <Text>
            <strong>restart</strong> tutorial
          </Text>
        }
        variant={'tutorial'}
        gutter={14.5}>
        <IconButton
          variant={'restart'}
          icon={<RepeatIcon />}
          onClick={() => dispatch(restartTutorial())}
        />
      </Tooltip>
      <Tooltip
        label={
          <Text>
            <strong>turn {tutorialOn ? 'off' : 'on'}</strong> tutorial
          </Text>
        }
        variant={'tutorial'}
        gutter={18.5}>
        <HStack>
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
      </Tooltip>
    </HStack>
  );
}
