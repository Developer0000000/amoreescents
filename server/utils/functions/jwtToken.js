const sendToken = async (user, res) => {

    const token = await user.generateToken();

    const options = {
        expires: new Date(
            Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
        ),
        httpOnly: true,
        sameSite: 'lax',
    }

    res.status(200).cookie("token", token, options).json({ success: true, user, token });

}

module.exports = sendToken