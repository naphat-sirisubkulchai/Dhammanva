/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";
import { useEditor, EditorContent, BubbleMenu } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { format } from "date-fns/format";
import "./Tiptap.scss";
import { Comment } from "./extensions/comment";
import { v4 as uuidv4 } from "uuid";
import {
  Button,
  Box,
  Flex,
  Textarea,
  HStack,
  Text,
  NumberInput,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInputField,
  NumberInputStepper,
} from "@chakra-ui/react";
// import { setTimeout } from "../../functions/time";
import { getCookie } from "typescript-cookie";
import { splitTime, generateTime } from "../../functions";
const dateTimeFormat = "dd.MM.yyyy HH:mm";

interface CommentInstance {
  uuid?: string;
  comments?: any[];
}

interface TipTapProps {
  defaultValue: string;
  setHTML: (html: string) => void;
}
const TimeCommentTiptap = ({ defaultValue, setHTML }: TipTapProps) => {
  const { hours, minutes, seconds } = splitTime(defaultValue);
  const [hourState, setHourState] = React.useState(hours);
  const [minuteState, setMinuteState] = React.useState(minutes);
  const [secondState, setSecondState] = React.useState(seconds);
  const username = getCookie("username");
  const editor = useEditor({
    extensions: [StarterKit, Comment],
    content: defaultValue || "",
    onUpdate({ editor }) {
      findCommentsAndStoreValues();

      setCurrentComment(editor);
    },

    onSelectionUpdate({ editor }) {
      setCurrentComment(editor);

      setIsTextSelected(!!editor.state.selection.content().size);
    },

    editorProps: {
      attributes: {
        spellcheck: "false",
      },
    },
  });

  const [commentText, setCommentText] = React.useState("");

  const [, setShowCommentMenu] = React.useState(false);

  const [, setIsTextSelected] = React.useState(false);

  const [, setShowAddCommentSection] =
    React.useState(true);

  const formatDate = (d: any) =>
    d ? format(new Date(d), dateTimeFormat) : null;

  const [activeCommentsInstance, setActiveCommentsInstance] =
    React.useState<CommentInstance>({});

  const [allComments, setAllComments] = React.useState<any[]>([]);

  const findCommentsAndStoreValues = () => {
    const parser = new DOMParser();
    const htmlText = editor?.getHTML() || defaultValue;
    const doc = parser.parseFromString(htmlText, "text/html");
    const comments = doc.querySelectorAll("span[data-comment]");

    const tempComments: any[] = [];

    comments.forEach((node) => {
      const nodeComments = node.getAttribute("data-comment");
      const jsonComments = nodeComments ? JSON.parse(nodeComments) : null;

      if (jsonComments !== null) {
        tempComments.push({
          node,
          jsonComments,
        });
      }
    });

    setAllComments(tempComments);
  };

  const setCurrentComment = (editor: any) => {
    const newVal = editor.isActive("comment");

    if (newVal) {
      setTimeout(() => setShowCommentMenu(newVal), 50);

      setShowAddCommentSection(!editor.state.selection.empty);

      const parsedComment = JSON.parse(editor.getAttributes("comment").comment);

      parsedComment.comment =
        typeof parsedComment.comments === "string"
          ? JSON.parse(parsedComment.comments)
          : parsedComment.comments;

      setActiveCommentsInstance(parsedComment);
    } else {
      setActiveCommentsInstance({});
    }
  };

  const setComment = () => {
    if (!commentText.trim().length) return;

    editor?.commands.selectAll();

    const activeCommentInstance: CommentInstance = JSON.parse(
      JSON.stringify(activeCommentsInstance)
    );

    const commentsArray =
      typeof activeCommentInstance.comments === "string"
        ? JSON.parse(activeCommentInstance.comments)
        : activeCommentInstance.comments;

    if (commentsArray) {
      commentsArray.push({
        userName: username,
        time: Date.now(),
        content: commentText,
      });

      const commentWithUuid = JSON.stringify({
        uuid: activeCommentsInstance.uuid || uuidv4(),
        comments: commentsArray,
      });

      // eslint-disable-next-line no-unused-expressions
      editor?.chain().setComment(commentWithUuid).run();
    } else {
      const commentWithUuid = JSON.stringify({
        uuid: uuidv4(),
        comments: [
          {
            userName: username,
            time: Date.now(),
            content: commentText,
          },
        ],
      });

      // eslint-disable-next-line no-unused-expressions
      editor?.chain().setComment(commentWithUuid).run();
    }

    setTimeout(() => setCommentText(""), 0.1);

    // force user to unselect
    editor?.commands.focus(editor?.state.doc.content.size);
    setHTML(editor?.getHTML() || defaultValue);

  };

  React.useEffect(() => {
    const timeoutId = setTimeout(findCommentsAndStoreValues, 100);
    return () => clearTimeout(timeoutId); // This is the cleanup function
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChangeHour = (e: any) => {
    setHourState(e);
    const fullTimeText = generateTime(e, minuteState, secondState);
    setCommentText(fullTimeText);
  };

  const handleChangeMinute = (e: any) => {
    setMinuteState(e);
    const fullTimeText = generateTime(hourState, e, secondState);
    setCommentText(fullTimeText);
  };

  const handleChangeSecond = (e: any) => {
    setSecondState(e);
    const fullTimeText = generateTime(hourState, minuteState, e);
    setCommentText(fullTimeText);
  };
  return (
    <Flex
      dir="row"
      className="tiptap"
      w="100%"
      bg="gray.100"
      p={2}
      borderRadius={"lg"}
      position="relative"
    >
      <Box className="tiptap-Box" w="60%">
        {editor && (
          <BubbleMenu
            tippy-options={{ duration: 100, placement: "right" }}
            editor={editor}
            shouldShow={() => !editor?.view.state.selection.empty}
          >
            <HStack shouldWrapChildren mb={2}>
              <NumberInput
                bg="white"
                size="xs"
                maxW={16}
                min={0}
                max={12}
                defaultValue={hourState}
                onChange={handleChangeHour}
              >
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
              <NumberInput
                size="xs"
                maxW={16}
                min={0}
                max={60}
                defaultValue={minuteState}
                onChange={handleChangeMinute}
                bg="white"
              >
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
              <NumberInput
                size="xs"
                maxW={16}
                min={0}
                max={60}
                defaultValue={secondState}
                onChange={handleChangeSecond}
                bg="white"
              >
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </HStack>
            <HStack>
              <Button onClick={() => setCommentText("")} variant="cancel">
                Clear
              </Button>
              <Button onClick={() => setComment()} variant="success">
                Add
              </Button>
            </HStack>
          </BubbleMenu>
        )}

        <EditorContent className="editor-content" editor={editor} />
      </Box>

      <Flex direction="column" pb={10}>
        {allComments.map((comment, i) => {
          return (
            <Box
              key={i + "external_comment"}
              bg="gray.100"
              shadow="lg"
              my={2}
              borderRadius={"md"}
              w="sm"
            >
              {comment.jsonComments.comments.map(
                (jsonComment: any, j: number) => {
                  return (
                    <Box
                      key={`${j}_${Math.random()}`}
                      p={3}
                      borderBottom="2px"
                      borderColor="gray.300"
                    >
                      <Flex direction="column">
                        <HStack>
                          <Text fontWeight={"semibold"}>
                            {jsonComment.userName}
                          </Text>
                          <Text fontSize={"sm"}>
                            {formatDate(jsonComment.time)}
                          </Text>
                        </HStack>
                        <Text>{jsonComment.content}</Text>
                      </Flex>
                    </Box>
                  );
                }
              )}

              {comment.jsonComments.uuid === activeCommentsInstance.uuid && (
                <Flex w="full" direction="column" gap={1}>
                  <Textarea
                    value={commentText}
                    onChange={(e) => setCommentText((e.target as any).value)}
                    placeholder="Add comment..."
                    bg="white"
                  />

                  <HStack>
                    <Button onClick={() => setCommentText("")} variant="cancel">
                      Clear
                    </Button>
                    <Button onClick={() => setComment()} variant="success">
                      Add
                    </Button>
                  </HStack>
                </Flex>
              )}
            </Box>
          );
        })}
      </Flex>
    </Flex>
  );
};

export default TimeCommentTiptap;
