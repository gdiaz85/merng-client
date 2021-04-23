import React, { useState } from 'react';
import gql from 'graphql-tag';
import { Button, Confirm, Popup } from 'semantic-ui-react';
import { useMutation } from '@apollo/client';
import { FETCH_POSTS_QUERY } from '../util/graphql';

const DELETE_POST_MUTATION = gql`
  mutation deletePost($postId: ID!) {
    deletePost(postId: $postId)
  }
`;

const DELETE_COMMENT_MUTATION = gql`
  mutation deleteComment($postId: ID!, $commentId: ID!) {
    deleteComment(postId: $postId, commentId: $commentId) {
      id
      comments {
        id
        username
        createdAt
        body
      }
      commentCount
    }
  }
`;

export default function DeleteButton({ postId, commentId, callback }) {
  const [confirmOpen, setconfirmOpen] = useState(false);

  const mutation = commentId ? DELETE_COMMENT_MUTATION : DELETE_POST_MUTATION;

  const [deletePostOrComment] = useMutation(mutation, {
    update(proxy) {
      setconfirmOpen(false);
      if (!commentId) {
        const data = proxy.readQuery({
          query: FETCH_POSTS_QUERY,
        });
        proxy.writeQuery({
          query: FETCH_POSTS_QUERY,
          data: { getPosts: data.getPosts.filter((p) => p.id !== postId) },
        });
      }
      if (callback) callback();
    },
    variables: {
      postId,
      commentId,
    },
  });
  return (
    <>
      {' '}
      <Popup
        content={`Delete ${commentId ? 'comment' : 'post'}`}
        inverted
        trigger={
          <Button
            as="div"
            color={'red'}
            icon="trash"
            floated="right"
            onClick={() => setconfirmOpen(true)}
          />
        }
      />
      <Confirm
        open={confirmOpen}
        onCancel={() => setconfirmOpen(false)}
        onConfirm={deletePostOrComment}
      />
    </>
  );
}
