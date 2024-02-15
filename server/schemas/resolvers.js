
const { User } = require('../models');
const { signToken, AuthenticationError } = require('../utils/auth');

const resolvers ={
    Query: {
        me: async (parent, args , context) => {
            if(context.user) {
                const userdata = await User.findOne({ _id: context.user._id }).select(
                    "-__v -password"
                );
                return userdata
            }
            throw AuthenticationError;
        },
    },

    Mutation: {
        addUser: async (parent,args) => {

            console.log("AAAAAAAAAAAAAA");
            console.log(args)
            const user = await User.create(args);
            const token = signToken(user);
            return { token,user };
        },
        login: async (parent, {email, password }) => {
            const user = await User.findOne({ email });

            if(!user){
                throw AuthenticationError;
            }

            const goodPw = await user.isCorrectPassword(password);

            if (!goodPw) {
                throw AuthenticationError
            }
            const token = signToken(user);

            return { token, user }
        },  

        saveBook: async (parent, { bookData }, context) => {
            if (context.user) {
                const newInv = await User.findByIdAndUpdate(
                    { _id: context.user._id },
                    { $push: { savedBooks: bookData } },
                    { new: true, runValidators: true }
                )
                return newInv;
            }
            throw AuthenticationError
        },
        removeBook: async (parent, { bookId }, context) => {
            if (context.user) {
                const newInv = await User.findOneAndUpdate(
                    { _id: context.user._id },
                    { $pull: { savedBooks: { bookId } } },
                    { new: true }
                );
                return newInv
            }
            throw AuthenticationError
        },

    
    },
}

module.exports = resolvers;